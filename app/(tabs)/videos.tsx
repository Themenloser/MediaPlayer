import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useApp } from '@/store/AppContext';
import { formatDuration, formatFileSize, getRelativeTime, groupMediaByDate } from '@/utils';
import { LocalMedia } from '@/types';

export default function VideosScreen() {
  const { state, refreshLocalMedia } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LocalMedia | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const videos = useMemo(() => {
    return state.localMedia.filter(media => media.type === 'video');
  }, [state.localMedia]);

  const groupedVideos = useMemo(() => {
    return groupMediaByDate(videos);
  }, [videos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLocalMedia();
    } catch (error) {
      Alert.alert('Fehler', 'Konnte Videos nicht aktualisieren');
    } finally {
      setRefreshing(false);
    }
  };

  const showVideoDetails = (video: LocalMedia) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const deleteVideo = async (videoId: string) => {
    Alert.alert(
      'Video löschen',
      'Bist du sicher, dass du dieses Video löschen möchtest?',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would need to be implemented in the storage service
              Alert.alert('Info', 'Löschfunktion wird noch implementiert');
              setModalVisible(false);
            } catch (error) {
              Alert.alert('Fehler', 'Video konnte nicht gelöscht werden');
            }
          },
        },
      ]
    );
  };

  const renderVideoItem = ({ item }: { item: LocalMedia }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => showVideoDetails(item)}
    >
      <View style={styles.videoInfo}>
        {item.thumbnail && (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        )}
        <View style={styles.videoDetails}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoMeta}>
            {formatDuration(item.duration)} • {formatFileSize(item.size)}
          </Text>
          <Text style={styles.videoDate}>
            {getRelativeTime(item.downloadDate)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => showVideoDetails(item)}
      >
        <Text style={styles.moreIcon}>⋯</Text>
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
    
    Object.entries(groupedVideos).forEach(([date, videos]) => {
      data.push({ type: 'header', title: date });
      videos.forEach(video => data.push({ type: 'item', item: video }));
    });
    
    return data;
  }, [groupedVideos]);

  const renderCombinedItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.title);
    }
    return item.item ? renderVideoItem({ item: item.item }) : null;
  };

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Keine Videos gefunden</Text>
        <Text style={styles.emptySubtitle}>
          Lade Videos über die Suche herunter, um hier angezeigt zu werden
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedVideo && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Video-Details</Text>
              <View style={styles.placeholder} />
            </View>
            
            {selectedVideo.thumbnail && (
              <Image 
                source={{ uri: selectedVideo.thumbnail }} 
                style={styles.modalThumbnail}
              />
            )}
            
            <View style={styles.modalContent}>
              <Text style={styles.modalVideoTitle}>{selectedVideo.title}</Text>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Dauer:</Text>
                <Text style={styles.modalInfoValue}>{formatDuration(selectedVideo.duration)}</Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Größe:</Text>
                <Text style={styles.modalInfoValue}>{formatFileSize(selectedVideo.size)}</Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Heruntergeladen:</Text>
                <Text style={styles.modalInfoValue}>
                  {getRelativeTime(selectedVideo.downloadDate)}
                </Text>
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Dateipfad:</Text>
                <Text style={styles.modalInfoValue} numberOfLines={2}>
                  {selectedVideo.filePath}
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.playButton]}
                  onPress={() => Alert.alert('Info', 'Wiedergabefunktion wird noch implementiert')}
                >
                  <Text style={styles.actionButtonText}>▶️ Abspielen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteVideo(selectedVideo.id)}
                >
                  <Text style={styles.actionButtonText}>🗑️ Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
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
  videoItem: {
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
  videoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 20,
    color: '#6c757d',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  placeholder: {
    width: 24,
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  modalContent: {
    padding: 16,
  },
  modalVideoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 20,
  },
  modalInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    width: 120,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  modalActions: {
    marginTop: 30,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
