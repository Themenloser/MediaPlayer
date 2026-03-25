export interface YouTubeSearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  url: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  channel: string;
  duration: string;
  uploadDate: string;
  views: string;
  url: string;
  formats?: VideoFormat[];
}

export interface VideoFormat {
  formatId: string;
  quality: string;
  fps?: number;
  mimeType: string;
  size: number;
  url: string;
}

export interface DownloadRequest {
  url: string;
  format?: string;
  quality?: string;
}

export interface DownloadProgress {
  id: string;
  url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
  filePath?: string;
}

export interface LocalMedia {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  filePath: string;
  thumbnail?: string;
  type: 'audio' | 'video';
  size: number;
  downloadDate: string;
  isFavorite: boolean;
}

export interface AppSettings {
  darkMode: 'system' | 'light' | 'dark';
  enableLogs: boolean;
  autoDownload: boolean;
  downloadQuality: 'low' | 'medium' | 'high';
}

export interface AppLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BackendStatus {
  status: string;
  version: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  songs: LocalMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteSong extends LocalMedia {
  addedToFavorites: string;
}
