import { apiService } from '@/services/api';
import { logger } from '@/services/logger';
import { useApp } from '@/store/AppContext';
import { YouTubeSearchResult } from '@/types';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { dispatch } = useApp();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Suchbegriff ein');
      return;
    }

    setIsSearching(true);
    Keyboard.dismiss();
    
    try {
      logger.info('Starting YouTube search', { query: searchQuery });
      const response = await apiService.searchYouTube(searchQuery);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
        logger.info('Search completed successfully', { 
          resultsCount: response.data.length 
        });
      } else {
        const errorMessage = response.error || 'Suche fehlgeschlagen';
        Alert.alert('Fehler', errorMessage);
        logger.error('YouTube search failed', { error: errorMessage });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      Alert.alert('Fehler', 'Suche fehlgeschlagen. Bitte versuche es erneut.');
      logger.error('YouTube search error', error);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [searchQuery]);

  const handleDownload = async (result: YouTubeSearchResult, type: 'audio' | 'video') => {
    try {
      logger.info('Starting download', { 
        videoId: result.id, 
        title: result.title, 
        type 
      });

      // Create download progress entry
      const downloadId = Date.now().toString();
      dispatch({
        type: 'UPDATE_DOWNLOAD',
        payload: {
          id: downloadId,
          url: result.url,
          progress: 0,
          status: 'pending',
        },
      });

      const downloadRequest = {
        url: result.url,
        quality: type === 'audio' ? 'medium' : '720p',
      };

      const response = type === 'audio' 
        ? await apiService.downloadAudio(downloadRequest)
        : await apiService.downloadVideo(downloadRequest);

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          payload: {
            id: downloadId,
            url: result.url,
            progress: 100,
            status: 'completed',
          },
        });

        Alert.alert(
          'Download gestartet',
          `${type === 'audio' ? 'Audio' : 'Video'} wird heruntergeladen. Du findest es in der ${type === 'audio' ? 'Playlist' : 'Videos'}-Übersicht.`
        );
        
        logger.info('Download started successfully', { 
          downloadId: response.data.downloadId,
          type 
        });
      } else {
        const errorMessage = response.error || 'Download fehlgeschlagen';
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          payload: {
            id: downloadId,
            url: result.url,
            progress: 0,
            status: 'failed',
            error: errorMessage,
          },
        });
        
        Alert.alert('Fehler', errorMessage);
        logger.error('Download failed', { error: errorMessage });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      Alert.alert('Fehler', 'Download fehlgeschlagen. Bitte versuche es erneut.');
      logger.error('Download error', error);
    }
  };

  const showDownloadOptions = (result: YouTubeSearchResult) => {
    Alert.alert(
      'Download-Optionen',
      `Was möchtest du herunterladen?\n\n${result.title}`,
      [
        {
          text: 'Audio (MP3)',
          onPress: () => handleDownload(result, 'audio'),
        },
        {
          text: 'Video',
          onPress: () => handleDownload(result, 'video'),
        },
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
      ]
    );
  };

  const renderSearchResult = ({ item }: { item: YouTubeSearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => showDownloadOptions(item)}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.thumbnail}
        defaultSource={require('@/assets/images/icon.png')}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {item.channel}
        </Text>
        <Text style={styles.duration}>
          {item.duration}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => showDownloadOptions(item)}
      >
        <Text style={styles.downloadIcon}>⬇️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="YouTube durchsuchen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Suchen</Text>
          )}
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Suche läuft...</Text>
        </View>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Keine Ergebnisse gefunden</Text>
          <Text style={styles.emptySubtitle}>
            Versuche es mit einem anderen Suchbegriff
          </Text>
        </View>
      )}

      {!isSearching && searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {!hasSearched && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>YouTube durchsuchen</Text>
          <Text style={styles.welcomeSubtitle}>
            Gib oben einen Suchbegriff ein, um Videos und Musik zu finden
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  channel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#adb5bd',
  },
  downloadButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  downloadIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
});
