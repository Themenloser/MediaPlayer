import { useApp } from '@/store/AppContext';
import { LocalMedia } from '@/types';
import { formatDuration, getRelativeTime } from '@/utils';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlaylistScreen() {
  const { state, refreshLocalMedia, addToFavorites, removeFromFavorites } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const { favorites, localMedia } = state;

  const favoriteSongs = useMemo(() => {
    return localMedia.filter(media => media.isFavorite && media.type === 'audio');
  }, [localMedia]);

  const otherSongs = useMemo(() => {
    return localMedia.filter(media => !media.isFavorite && media.type === 'audio');
  }, [localMedia]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLocalMedia();
    } catch (error) {
      Alert.alert('Fehler', 'Konnte Playlist nicht aktualisieren');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = async (mediaId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await removeFromFavorites(mediaId);
      } else {
        await addToFavorites(mediaId);
      }
    } catch (error) {
      Alert.alert('Fehler', 'Konnte Favoritenstatus nicht ändern');
    }
  };

  const renderSongItem = ({ item }: { item: LocalMedia }) => (
    <TouchableOpacity style={styles.songItem}>
      <View style={styles.songInfo}>
        {item.thumbnail && (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        )}
        <View style={styles.songDetails}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songMeta}>
            {item.artist || 'Unbekannter Künstler'} • {formatDuration(item.duration)}
          </Text>
          <Text style={styles.songDate}>
            {getRelativeTime(item.downloadDate)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id, item.isFavorite)}
      >
        <Text style={styles.favoriteIcon}>
          {item.isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const combinedData = useMemo(() => {
    const data: Array<{ type: 'header' | 'item'; title?: string; item?: LocalMedia }> = [];
    
    if (favoriteSongs.length > 0) {
      data.push({ type: 'header', title: 'Lieblingssongs' });
      favoriteSongs.forEach(song => data.push({ type: 'item', item: song }));
    }
    
    if (otherSongs.length > 0) {
      data.push({ type: 'header', title: 'Alle Songs' });
      otherSongs.forEach(song => data.push({ type: 'item', item: song }));
    }
    
    return data;
  }, [favoriteSongs, otherSongs]);

  const renderCombinedItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.title);
    }
    return item.item ? renderSongItem({ item: item.item }) : null;
  };

  if (localMedia.filter(m => m.type === 'audio').length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Keine Musik gefunden</Text>
        <Text style={styles.emptySubtitle}>
          Lade Musik über die Suche herunter, um hier angezeigt zu werden
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={combinedData}
        renderItem={renderCombinedItem}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header-${index}` : item.item?.id || `item-${index}`
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingVertical: 8,
  },
  sectionHeader: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  songInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  songMeta: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  songDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
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
});
