import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppSettings, LocalMedia, AppLog, DownloadProgress } from '../types';
import { settingsService } from '../services/settings';
import { storageService } from '../services/storage';
import { logger } from '../services/logger';

interface AppState {
  settings: AppSettings;
  localMedia: LocalMedia[];
  favorites: string[];
  downloads: DownloadProgress[];
  logs: AppLog[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_LOCAL_MEDIA'; payload: LocalMedia[] }
  | { type: 'ADD_LOCAL_MEDIA'; payload: LocalMedia }
  | { type: 'UPDATE_LOCAL_MEDIA'; payload: { id: string; updates: Partial<LocalMedia> } }
  | { type: 'REMOVE_LOCAL_MEDIA'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_DOWNLOADS'; payload: DownloadProgress[] }
  | { type: 'UPDATE_DOWNLOAD'; payload: DownloadProgress }
  | { type: 'ADD_LOG'; payload: AppLog }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  settings: {
    darkMode: 'system',
    enableLogs: true,
    autoDownload: false,
    downloadQuality: 'medium',
  },
  localMedia: [],
  favorites: [],
  downloads: [],
  logs: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    
    case 'SET_LOCAL_MEDIA':
      return { ...state, localMedia: action.payload };
    
    case 'ADD_LOCAL_MEDIA':
      return { 
        ...state, 
        localMedia: [...state.localMedia, action.payload] 
      };
    
    case 'UPDATE_LOCAL_MEDIA':
      return {
        ...state,
        localMedia: state.localMedia.map(media =>
          media.id === action.payload.id
            ? { ...media, ...action.payload.updates }
            : media
        ),
      };
    
    case 'REMOVE_LOCAL_MEDIA':
      return {
        ...state,
        localMedia: state.localMedia.filter(media => media.id !== action.payload),
      };
    
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
    
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload),
      };
    
    case 'SET_DOWNLOADS':
      return { ...state, downloads: action.payload };
    
    case 'UPDATE_DOWNLOAD':
      const existingIndex = state.downloads.findIndex(d => d.id === action.payload.id);
      if (existingIndex >= 0) {
        const updatedDownloads = [...state.downloads];
        updatedDownloads[existingIndex] = action.payload;
        return { ...state, downloads: updatedDownloads };
      }
      return { ...state, downloads: [...state.downloads, action.payload] };
    
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshLocalMedia: () => Promise<void>;
  addToFavorites: (mediaId: string) => Promise<void>;
  removeFromFavorites: (mediaId: string) => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load settings
        const settings = await settingsService.getSettings();
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        
        // Load local media
        const media = await storageService.getLocalMedia();
        dispatch({ type: 'SET_LOCAL_MEDIA', payload: media });
        
        // Load favorites
        const favorites = await storageService.getFavorites();
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
        
        // Load logs
        const logs = logger.getLogs();
        logs.forEach(log => dispatch({ type: 'ADD_LOG', payload: log }));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to initialize app', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await settingsService.updateSettings(state.settings);
      } catch (error) {
        logger.error('Failed to save settings', error);
      }
    };

    if (state.settings !== initialState.settings) {
      saveSettings();
    }
  }, [state.settings]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const newSettings = await settingsService.updateSettings(updates);
      dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logger.error('Failed to update settings', error);
    }
  };

  const refreshLocalMedia = async () => {
    try {
      const media = await storageService.getLocalMedia();
      dispatch({ type: 'SET_LOCAL_MEDIA', payload: media });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh media';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logger.error('Failed to refresh local media', error);
    }
  };

  const addToFavorites = async (mediaId: string) => {
    try {
      await storageService.addToFavorites(mediaId);
      dispatch({ type: 'ADD_FAVORITE', payload: mediaId });
      dispatch({ type: 'UPDATE_LOCAL_MEDIA', payload: { id: mediaId, updates: { isFavorite: true } } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to favorites';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logger.error('Failed to add to favorites', error);
    }
  };

  const removeFromFavorites = async (mediaId: string) => {
    try {
      await storageService.removeFromFavorites(mediaId);
      dispatch({ type: 'REMOVE_FAVORITE', payload: mediaId });
      dispatch({ type: 'UPDATE_LOCAL_MEDIA', payload: { id: mediaId, updates: { isFavorite: false } } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from favorites';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logger.error('Failed to remove from favorites', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: AppContextType = {
    state,
    dispatch,
    updateSettings,
    refreshLocalMedia,
    addToFavorites,
    removeFromFavorites,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
