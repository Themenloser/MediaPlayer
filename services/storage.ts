import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { LocalMedia, Playlist } from '../types';

const MEDIA_KEY = 'mediaplayer_media';
const PLAYLISTS_KEY = 'mediaplayer_playlists';
const FAVORITES_KEY = 'mediaplayer_favorites';

class StorageService {
  private mediaDirectory: string;

  constructor() {
    this.mediaDirectory = `${FileSystem.documentDirectory || ''}media/`;
  }

  async ensureMediaDirectory(): Promise<string> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.mediaDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.mediaDirectory, { intermediates: true });
      }
      return this.mediaDirectory;
    } catch (error) {
      console.error('Failed to create media directory:', error);
      throw error;
    }
  }

  async getLocalMedia(): Promise<LocalMedia[]> {
    try {
      const stored = await AsyncStorage.getItem(MEDIA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load local media:', error);
      return [];
    }
  }

  async addLocalMedia(media: Omit<LocalMedia, 'id' | 'downloadDate'>): Promise<LocalMedia> {
    try {
      const currentMedia = await this.getLocalMedia();
      const newMedia: LocalMedia = {
        ...media,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        downloadDate: new Date().toISOString(),
      };
      
      const updatedMedia = [...currentMedia, newMedia];
      await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(updatedMedia));
      return newMedia;
    } catch (error) {
      console.error('Failed to add local media:', error);
      throw error;
    }
  }

  async updateLocalMedia(id: string, updates: Partial<LocalMedia>): Promise<LocalMedia | null> {
    try {
      const currentMedia = await this.getLocalMedia();
      const index = currentMedia.findIndex(m => m.id === id);
      
      if (index === -1) return null;
      
      const updatedMedia = { ...currentMedia[index], ...updates };
      currentMedia[index] = updatedMedia;
      
      await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(currentMedia));
      return updatedMedia;
    } catch (error) {
      console.error('Failed to update local media:', error);
      throw error;
    }
  }

  async removeLocalMedia(id: string): Promise<boolean> {
    try {
      const currentMedia = await this.getLocalMedia();
      const mediaToRemove = currentMedia.find(m => m.id === id);
      
      if (!mediaToRemove) return false;
      
      // Delete the actual file
      try {
        await FileSystem.deleteAsync(mediaToRemove.filePath, { idempotent: true });
      } catch (fileError) {
        console.warn('Failed to delete media file:', fileError);
      }
      
      // Remove from storage
      const updatedMedia = currentMedia.filter(m => m.id !== id);
      await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(updatedMedia));
      return true;
    } catch (error) {
      console.error('Failed to remove local media:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  async addToFavorites(mediaId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(mediaId)) {
        favorites.push(mediaId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        await this.updateLocalMedia(mediaId, { isFavorite: true });
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(mediaId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== mediaId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      await this.updateLocalMedia(mediaId, { isFavorite: false });
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const stored = await AsyncStorage.getItem(PLAYLISTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load playlists:', error);
      return [];
    }
  }

  async createPlaylist(name: string): Promise<Playlist> {
    try {
      const playlists = await this.getPlaylists();
      const newPlaylist: Playlist = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedPlaylists = [...playlists, newPlaylist];
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
      return newPlaylist;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    audioFiles: number;
    videoFiles: number;
  }> {
    try {
      const media = await this.getLocalMedia();
      const stats = {
        totalFiles: media.length,
        totalSize: media.reduce((sum, m) => sum + m.size, 0),
        audioFiles: media.filter(m => m.type === 'audio').length,
        videoFiles: media.filter(m => m.type === 'video').length,
      };
      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        audioFiles: 0,
        videoFiles: 0,
      };
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([MEDIA_KEY, PLAYLISTS_KEY, FAVORITES_KEY]);
      
      // Clear media directory
      try {
        await FileSystem.deleteAsync(this.mediaDirectory, { idempotent: true });
        await this.ensureMediaDirectory();
      } catch (fileError) {
        console.warn('Failed to clear media directory:', fileError);
      }
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
export default StorageService;
