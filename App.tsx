import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import ApiManager from './services/ApiManagerService';
import UpdateService from './services/UpdateService';
import { UpdateInfo, ApiVersionInfo } from './types';

export default function App() {
  const [apiUrl, setApiUrl] = useState<string>('http://10.0.2.2:5000/api');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiVersion, setApiVersion] = useState<string>('-');
  const [apiInfo, setApiInfo] = useState<ApiVersionInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    loadSavedUrl();
  }, []);

  const loadSavedUrl = async () => {
    const savedUrl = await ApiManager.getApiUrl();
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setApiVersion('-');
    setApiInfo(null);
    setUpdateInfo(null);

    try {
      await ApiManager.setApiUrl(apiUrl);

      // Verificar version de la API
      const versionResult = await ApiManager.checkApiVersion();

      if (versionResult.currentVersion) {
        setApiVersion(versionResult.currentVersion);
        setApiInfo(versionResult.apiInfo || null);
        setConnectionStatus('success');

        if (!versionResult.isValid && versionResult.message) {
          Alert.alert('Advertencia de Compatibilidad', versionResult.message);
        }

        // Verificar actualizaciones
        await checkUpdates();
      } else {
        setConnectionStatus('error');
        Alert.alert('Error', versionResult.message || 'No se pudo conectar a la API');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      Alert.alert('Error de Conexión', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUpdates = async () => {
    const update = await UpdateService.checkForUpdates();
    setUpdateInfo(update);

    if (update?.needsUpdate) {
      const message = update.forceUpdate
        ? `Es necesario actualizar a la versión ${update.latestVersion}.\n\n${update.releaseNotes || ''}`
        : `Hay una nueva versión disponible: ${update.latestVersion}\n\n${update.releaseNotes || ''}`;

      Alert.alert(
        update.forceUpdate ? 'Actualización Obligatoria' : 'Actualización Disponible',
        message,
        [
          ...(update.forceUpdate ? [] : [{ text: 'Más Tarde', style: 'cancel' as const }]),
          {
            text: 'Actualizar',
            onPress: () => handleDownloadUpdate(update.downloadUrl)
          }
        ]
      );
    }
  };

  const handleDownloadUpdate = async (downloadUrl: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Info', 'Auto-actualización solo disponible en Android');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    await UpdateService.downloadAndInstall(downloadUrl, (progress) => {
      setDownloadProgress(progress);
    });

    setIsDownloading(false);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>JobActualizador</Text>
        <Text style={styles.subtitle}>Sistema de Autoactualización</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configuración API</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="URL de la API"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Conectar</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de Versiones</Text>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Versión de la App:</Text>
          <Text style={styles.versionValue}>{appVersion}</Text>
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Versión de la API:</Text>
          <View style={styles.versionWithStatus}>
            <Text style={styles.versionValue}>{apiVersion}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          </View>
        </View>

        {apiInfo && (
          <>
            <View style={styles.divider} />
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Framework:</Text>
              <Text style={styles.versionValue}>{apiInfo.framework}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Título:</Text>
              <Text style={styles.versionValue}>{apiInfo.title}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Versión mínima cliente:</Text>
              <Text style={styles.versionValue}>{apiInfo.min_client_version}</Text>
            </View>
            {apiInfo.compatible_versions?.length > 0 && (
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Versiones compatibles:</Text>
                <Text style={styles.versionValue}>{apiInfo.compatible_versions.join(', ')}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {updateInfo && (
        <View style={[styles.card, updateInfo.needsUpdate ? styles.cardWarning : styles.cardSuccess]}>
          <Text style={styles.cardTitle}>Estado de Actualización</Text>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Versión Actual:</Text>
            <Text style={styles.versionValue}>{updateInfo.currentVersion}</Text>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Última Versión:</Text>
            <Text style={styles.versionValue}>{updateInfo.latestVersion}</Text>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Necesita Actualizar:</Text>
            <Text style={[
              styles.versionValue,
              { color: updateInfo.needsUpdate ? '#f44336' : '#4CAF50' }
            ]}>
              {updateInfo.needsUpdate ? 'Sí' : 'No'}
            </Text>
          </View>

          {updateInfo.needsUpdate && (
            <>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Actualización Forzada:</Text>
                <Text style={[
                  styles.versionValue,
                  { color: updateInfo.forceUpdate ? '#f44336' : '#4CAF50' }
                ]}>
                  {updateInfo.forceUpdate ? 'Sí' : 'No'}
                </Text>
              </View>

              {updateInfo.releaseNotes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notas de versión:</Text>
                  <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, styles.buttonUpdate, isDownloading && styles.buttonDisabled]}
                onPress={() => handleDownloadUpdate(updateInfo.downloadUrl)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <View style={styles.downloadProgress}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>
                      {' '}{Math.round(downloadProgress * 100)}%
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Descargar Actualización</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Jobers Soluciones Informáticas</Text>
        <Text style={styles.footerText}>Proyecto de prueba para sistema de autoactualizador</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
  },
  buttonUpdate: {
    backgroundColor: '#FF9800',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  versionWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
