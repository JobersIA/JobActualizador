//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: update.tsx
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import UpdateService from '../services/UpdateService';
import SimulationService from '../services/SimulationService';
import { UpdateInfo } from '../types';
import { Debug } from '../utils/Debug';

// Colores Jobers
const COLORS = {
  GREEN: '#228B22',
  GREEN_DARK: '#1a6b1a',
  GREEN_LIGHT: '#e8f5e9',
  ORANGE: '#FF6200',
  ORANGE_LIGHT: '#ffe8d6',
  RED: '#f44336',
  WHITE: '#fff',
  GRAY: '#999',
  GRAY_LIGHT: '#f5f5f5',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#666',
};

Debug.trace('update.tsx', 'File loaded');

export default function UpdateScreen() {
  Debug.trace('UpdateScreen', 'Component function called');

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [simulationEnabled, setSimulationEnabled] = useState<boolean>(false);

  Debug.trace('UpdateScreen', 'useState hooks initialized');

  useEffect(() => {
    Debug.trace('UpdateScreen', 'useEffect running');
    loadSimulationState();
  }, []);

  const loadSimulationState = async () => {
    Debug.trace('UpdateScreen', 'loadSimulationState start');
    try {
      const state = await SimulationService.getState();
      Debug.log('UpdateScreen simulation state:', state);
      setSimulationEnabled(state.enabled);
      Debug.trace('UpdateScreen', 'loadSimulationState complete');
    } catch (error) {
      Debug.error('UpdateScreen loadSimulationState error:', error);
    }
  };

  const checkUpdates = async () => {
    Debug.trace('UpdateScreen', 'checkUpdates start');
    setIsChecking(true);
    setUpdateInfo(null);

    try {
      const update = await UpdateService.checkForUpdates();
      Debug.log('UpdateScreen update result:', update);
      setUpdateInfo(update);

      if (!update) {
        Alert.alert('Info', 'No se pudo verificar actualizaciones. Asegúrese de conectar primero a la API.');
      } else if (update.needsUpdate) {
        const message = update.forceUpdate
          ? `Es necesario actualizar a la versión ${update.latestVersion}.`
          : `Hay una nueva versión disponible: ${update.latestVersion}`;
        Alert.alert(
          update.forceUpdate ? 'Actualización Obligatoria' : 'Actualización Disponible',
          message
        );
      } else {
        Alert.alert('Actualizado', 'Ya tiene la última versión.');
      }
    } catch (error: any) {
      Debug.error('UpdateScreen checkUpdates error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsChecking(false);
      Debug.trace('UpdateScreen', 'checkUpdates complete');
    }
  };

  const handleDownloadUpdate = async () => {
    Debug.trace('UpdateScreen', 'handleDownloadUpdate start');
    if (!updateInfo?.downloadUrl) return;

    if (Platform.OS !== 'android') {
      Alert.alert('Info', 'Auto-actualización solo disponible en Android');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const success = await UpdateService.downloadAndInstall(
        updateInfo.downloadUrl,
        (progress) => setDownloadProgress(progress),
        updateInfo.latestVersion
      );
      Debug.log('UpdateScreen download success:', success);

      if (success && simulationEnabled) {
        await loadSimulationState();
        await checkUpdates();
      }
    } catch (error) {
      Debug.error('UpdateScreen handleDownloadUpdate error:', error);
    } finally {
      setIsDownloading(false);
      Debug.trace('UpdateScreen', 'handleDownloadUpdate complete');
    }
  };

  Debug.trace('UpdateScreen', 'About to render JSX');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {simulationEnabled && (
        <View style={styles.simulationBanner}>
          <Text style={styles.simulationBannerText}>MODO SIMULACIÓN ACTIVO</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verificar Actualizaciones</Text>
        <Text style={styles.description}>
          Comprueba si hay una nueva versión disponible de la aplicación.
        </Text>
        <TouchableOpacity
          style={[styles.button, isChecking && styles.buttonDisabled]}
          onPress={checkUpdates}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Comprobar Actualizaciones</Text>
          )}
        </TouchableOpacity>
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
              { color: updateInfo.needsUpdate ? COLORS.RED : COLORS.GREEN }
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
                  { color: updateInfo.forceUpdate ? COLORS.RED : COLORS.GREEN }
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
                onPress={handleDownloadUpdate}
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
                  <Text style={styles.buttonText}>
                    {simulationEnabled ? 'Simular Actualización' : 'Descargar Actualización'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {!updateInfo && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Pulse "Comprobar Actualizaciones" para verificar si hay nuevas versiones disponibles.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  contentContainer: {
    padding: 16,
  },
  simulationBanner: {
    backgroundColor: COLORS.ORANGE,
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  simulationBannerText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ORANGE,
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.GREEN,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.GREEN,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.GREEN_LIGHT,
  },
  buttonUpdate: {
    backgroundColor: COLORS.ORANGE,
    marginTop: 12,
  },
  buttonText: {
    color: COLORS.WHITE,
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
    color: COLORS.GRAY_MEDIUM,
    flex: 1,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: COLORS.GRAY_MEDIUM,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});
