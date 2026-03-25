import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'mediaplayer_settings';

class SettingsService {
  private defaultSettings: AppSettings = {
    darkMode: 'system',
    enableLogs: true,
    autoDownload: false,
    downloadQuality: 'medium',
  };

  async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaultSettings, ...parsed };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  async resetSettings(): Promise<AppSettings> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        settings,
      }, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }

  async importSettings(settingsJson: string): Promise<AppSettings> {
    try {
      const imported = JSON.parse(settingsJson);
      if (imported.settings) {
        return this.updateSettings(imported.settings);
      }
      return this.updateSettings(imported);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default SettingsService;
