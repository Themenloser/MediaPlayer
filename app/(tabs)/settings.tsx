import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useApp } from '@/store/AppContext';
import { logger } from '@/services/logger';
import { apiService } from '@/services/api';
import { settingsService } from '@/services/settings';
import { storageService } from '@/services/storage';

export default function SettingsScreen() {
  const { state, updateSettings, dispatch } = useApp();
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  const { settings, logs } = state;

  const logStats = useMemo(() => {
    return logger.getLogStats();
  }, [logs]);

  const checkBackendStatus = async () => {
    try {
      const response = await apiService.getBackendStatus();
      if (response.success && response.data) {
        setBackendStatus(response.data);
        Alert.alert('Backend-Status', 'Backend ist erreichbar');
      } else {
        Alert.alert('Backend-Status', 'Backend ist nicht erreichbar');
      }
    } catch (error) {
      Alert.alert('Backend-Status', 'Fehler bei der Verbindung zum Backend');
    }
  };

  const exportLogs = async () => {
    try {
      const logsData = logger.exportLogs();
      await Share.share({
        message: logsData,
        title: 'MediaPlayer Logs',
      });
    } catch (error) {
      Alert.alert('Fehler', 'Logs konnten nicht exportiert werden');
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Logs löschen',
      'Bist du sicher, dass du alle Logs löschen möchtest?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            logger.clearLogs();
            dispatch({ type: 'CLEAR_LOGS' });
            Alert.alert('Erfolg', 'Logs wurden gelöscht');
          },
        },
      ]
    );
  };

  const clearCache = async () => {
    try {
      await storageService.clearAllData();
      dispatch({ type: 'SET_LOCAL_MEDIA', payload: [] });
      dispatch({ type: 'SET_FAVORITES', payload: [] });
      Alert.alert('Erfolg', 'Cache wurde geleert');
    } catch (error) {
      Alert.alert('Fehler', 'Cache konnte nicht geleert werden');
    }
  };

  const exportSettings = async () => {
    try {
      const settingsData = await settingsService.exportSettings();
      await Share.share({
        message: settingsData,
        title: 'MediaPlayer Settings',
      });
    } catch (error) {
      Alert.alert('Fehler', 'Einstellungen konnten nicht exportiert werden');
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Einstellungen zurücksetzen',
      'Bist du sicher, dass du alle Einstellungen zurücksetzen möchtest?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultSettings = await settingsService.resetSettings();
              dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
              Alert.alert('Erfolg', 'Einstellungen wurden zurückgesetzt');
            } catch (error) {
              Alert.alert('Fehler', 'Einstellungen konnten nicht zurückgesetzt werden');
            }
          },
        },
      ]
    );
  };

  const openGitHub = () => {
    Linking.openURL('https://github.com/Themenloser/Yt');
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App-Informationen */}
      {renderSection(
        'App-Informationen',
        <>
          {renderSettingItem(
            'Version',
            '1.0.0 (Build 1)',
            undefined,
            <Text style={styles.settingValue}>v1.0.0</Text>
          )}
          {renderSettingItem(
            'Backend-Status',
            backendStatus ? 'Verbunden' : 'Unbekannt',
            checkBackendStatus,
            <Text style={[styles.settingValue, { color: backendStatus ? '#28a745' : '#ffc107' }]}>
              {backendStatus ? '🟢' : '🟡'}
            </Text>
          )}
          {renderSettingItem(
            'GitHub Repository',
            'Backend-Quellcode',
            openGitHub,
            <Text style={styles.settingValue}>🔗</Text>
          )}
        </>
      )}

      {/* Einstellungen */}
      {renderSection(
        'Einstellungen',
        <>
          {renderSettingItem(
            'Dark Mode',
            settings.darkMode === 'system' 
              ? 'System' 
              : settings.darkMode === 'dark' 
                ? 'Dunkel' 
                : 'Hell',
            () => {
              const modes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
              const currentIndex = modes.indexOf(settings.darkMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              updateSettings({ darkMode: nextMode });
            },
            <Text style={styles.settingValue}>
              {settings.darkMode === 'system' ? '🌓' : settings.darkMode === 'dark' ? '🌙' : '☀️'}
            </Text>
          )}
          {renderSettingItem(
            'Logs aktivieren',
            'App-Aktivitäten protokollieren',
            () => updateSettings({ enableLogs: !settings.enableLogs }),
            <Switch
              value={settings.enableLogs}
              onValueChange={(value) => updateSettings({ enableLogs: value })}
            />
          )}
          {renderSettingItem(
            'Auto-Download',
            'Automatisch herunterladen',
            () => updateSettings({ autoDownload: !settings.autoDownload }),
            <Switch
              value={settings.autoDownload}
              onValueChange={(value) => updateSettings({ autoDownload: value })}
            />
          )}
          {renderSettingItem(
            'Download-Qualität',
            settings.downloadQuality,
            () => {
              const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
              const currentIndex = qualities.indexOf(settings.downloadQuality);
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              updateSettings({ downloadQuality: nextQuality });
            },
            <Text style={styles.settingValue}>
              {settings.downloadQuality === 'low' ? 'Niedrig' : 
               settings.downloadQuality === 'medium' ? 'Mittel' : 'Hoch'}
            </Text>
          )}
        </>
      )}

      {/* Logs */}
      {renderSection(
        'Logs',
        <>
          {renderSettingItem(
            'Logs ansehen',
            `${logStats.total} Einträge (${logStats.error} Fehler)`,
            () => setShowDebugMenu(!showDebugMenu)
          )}
          {renderSettingItem('Logs exportieren', undefined, exportLogs)}
          {renderSettingItem('Logs löschen', undefined, clearLogs)}
        </>
      )}

      {/* Debug-Menü */}
      {showDebugMenu && renderSection(
        'Debug-Menü',
        <>
          {renderSettingItem(
            'Info-Logs',
            `${logStats.info} Einträge`,
            undefined,
            <Text style={styles.settingValue}>{logStats.info}</Text>
          )}
          {renderSettingItem(
            'Warning-Logs',
            `${logStats.warning} Einträge`,
            undefined,
            <Text style={styles.settingValue}>{logStats.warning}</Text>
          )}
          {renderSettingItem(
            'Error-Logs',
            `${logStats.error} Einträge`,
            undefined,
            <Text style={styles.settingValue}>{logStats.error}</Text>
          )}
          {renderSettingItem(
            'Debug-Logs',
            `${logStats.debug} Einträge`,
            undefined,
            <Text style={styles.settingValue}>{logStats.debug}</Text>
          )}
        </>
      )}

      {/* Datenverwaltung */}
      {renderSection(
        'Datenverwaltung',
        <>
          {renderSettingItem('Einstellungen exportieren', undefined, exportSettings)}
          {renderSettingItem('Einstellungen zurücksetzen', undefined, resetSettings)}
          {renderSettingItem('Cache leeren', undefined, clearCache)}
        </>
      )}

      {/* Technische Infos */}
      {renderSection(
        'Technische Infos',
        <>
          {renderSettingItem(
            'Expo SDK',
            '55.0.0',
            undefined,
            <Text style={styles.settingValue}>55.0.0</Text>
          )}
          {renderSettingItem(
            'React Native',
            '0.83.2',
            undefined,
            <Text style={styles.settingValue}>0.83.2</Text>
          )}
          {renderSettingItem(
            'Plattform',
            'iOS',
            undefined,
            <Text style={styles.settingValue}>iOS</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#202124',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#5f6368',
  },
  settingValue: {
    fontSize: 16,
    color: '#5f6368',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#5f6368',
    marginRight: 4,
  },
});
