//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: index.tsx
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
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import ApiManager from '../services/ApiManagerService';
import SimulationService from '../services/SimulationService';
import { ApiVersionInfo } from '../types';
import { Debug } from '../utils/Debug';

// Colores Jobers
const COLORS = {
  GREEN: '#228B22',
  GREEN_DARK: '#1a6b1a',
  GREEN_LIGHT: '#e8f5e9',
  ORANGE: '#FF6200',
  ORANGE_LIGHT: '#ffe8d6',
  WHITE: '#fff',
  GRAY: '#999',
  GRAY_LIGHT: '#f5f5f5',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#666',
};

Debug.trace('index.tsx', 'File loaded');

export default function ApiScreen() {
  Debug.trace('ApiScreen', 'Component function called');

  const [apiUrl, setApiUrl] = useState<string>('http://10.0.2.2:5000/api');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiVersion, setApiVersion] = useState<string>('-');
  const [apiInfo, setApiInfo] = useState<ApiVersionInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [simulationEnabled, setSimulationEnabled] = useState<boolean>(false);
  const [displayVersion, setDisplayVersion] = useState<string>('1.0.0');

  Debug.trace('ApiScreen', 'useState hooks initialized');

  useEffect(() => {
    Debug.trace('ApiScreen', 'useEffect running');
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    Debug.trace('ApiScreen', 'loadInitialData start');
    try {
      const savedUrl = await ApiManager.getApiUrl();
      Debug.log('ApiScreen savedUrl:', savedUrl);
      if (savedUrl) {
        setApiUrl(savedUrl);
      }
      await loadSimulationState();
      Debug.trace('ApiScreen', 'loadInitialData complete');

      // Auto-conectar si ya hay URL guardada
      if (savedUrl && savedUrl !== 'http://localhost:5000/api') {
        Debug.trace('ApiScreen', 'Auto-connecting to saved URL');
        await autoConnect(savedUrl);
      }
    } catch (error) {
      Debug.error('ApiScreen loadInitialData error:', error);
    }
  };

  const autoConnect = async (url: string) => {
    Debug.trace('ApiScreen', 'autoConnect start');
    setIsLoading(true);
    setConnectionStatus('idle');

    try {
      const versionResult = await ApiManager.checkApiVersion();
      Debug.log('ApiScreen autoConnect versionResult:', versionResult);

      if (versionResult.currentVersion) {
        setApiVersion(versionResult.currentVersion);
        setApiInfo(versionResult.apiInfo || null);
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error: any) {
      Debug.error('ApiScreen autoConnect error:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
      Debug.trace('ApiScreen', 'autoConnect complete');
    }
  };

  const loadSimulationState = async () => {
    Debug.trace('ApiScreen', 'loadSimulationState start');
    try {
      const state = await SimulationService.getState();
      Debug.log('ApiScreen simulation state:', state);
      setSimulationEnabled(state.enabled);
      setDisplayVersion(state.enabled ? state.appVersion : state.realAppVersion);
      Debug.trace('ApiScreen', 'loadSimulationState complete');
    } catch (error) {
      Debug.error('ApiScreen loadSimulationState error:', error);
    }
  };

  const handleConnect = async () => {
    Debug.trace('ApiScreen', 'handleConnect start');
    setIsLoading(true);
    setConnectionStatus('idle');
    setApiVersion('-');
    setApiInfo(null);

    try {
      await ApiManager.setApiUrl(apiUrl);
      const versionResult = await ApiManager.checkApiVersion();
      Debug.log('ApiScreen versionResult:', versionResult);

      if (versionResult.currentVersion) {
        setApiVersion(versionResult.currentVersion);
        setApiInfo(versionResult.apiInfo || null);
        setConnectionStatus('success');

        if (!versionResult.isValid && versionResult.message) {
          Alert.alert('Advertencia de Compatibilidad', versionResult.message);
        }
      } else {
        setConnectionStatus('error');
        Alert.alert('Error', versionResult.message || 'No se pudo conectar a la API');
      }
    } catch (error: any) {
      Debug.error('ApiScreen handleConnect error:', error);
      setConnectionStatus('error');
      Alert.alert('Error de Conexión', error.message);
    } finally {
      setIsLoading(false);
      Debug.trace('ApiScreen', 'handleConnect complete');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  Debug.trace('ApiScreen', 'About to render JSX');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>JobActualizador<Text style={styles.trademark}>®</Text></Text>
      </View>

      {simulationEnabled && (
        <View style={styles.simulationBanner}>
          <Text style={styles.simulationBannerText}>MODO SIMULACIÓN ACTIVO</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Conexión API</Text>
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
          <View style={styles.versionWithStatus}>
            <Text style={styles.versionValue}>{displayVersion}</Text>
            {simulationEnabled && (
              <Text style={styles.simulatedTag}>(sim)</Text>
            )}
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 10,
  },
  logo: {
    width: 180,
    height: 80,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.GREEN_DARK,
    marginTop: 8,
  },
  trademark: {
    fontSize: 10,
    lineHeight: 18,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
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
  versionWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simulatedTag: {
    fontSize: 12,
    color: COLORS.ORANGE,
    marginLeft: 6,
    fontStyle: 'italic',
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
    marginVertical: 8,
  },
});
