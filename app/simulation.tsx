//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: simulation.tsx
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import SimulationService, { SimulationState } from '../services/SimulationService';
import { Debug } from '../utils/Debug';

// Colores Jobers
const COLORS = {
  GREEN: '#228B22',
  GREEN_DARK: '#1a6b1a',
  GREEN_LIGHT: '#e8f5e9',
  ORANGE: '#FF6200',
  ORANGE_LIGHT: '#ffe8d6',
  RED: '#f44336',
  PURPLE: '#9C27B0',
  WHITE: '#fff',
  GRAY: '#999',
  GRAY_LIGHT: '#f5f5f5',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#666',
};

Debug.trace('simulation.tsx', 'File loaded');

export default function SimulationScreen() {
  Debug.trace('SimulationScreen', 'Component function called');

  const [simulation, setSimulation] = useState<SimulationState>({
    enabled: false,
    appVersion: '1.0.0',
    buildDate: '',
    installCount: 0,
    realAppVersion: '1.0.0',
  });
  const [editingVersion, setEditingVersion] = useState<string>('');

  Debug.trace('SimulationScreen', 'useState hooks initialized');

  useEffect(() => {
    Debug.trace('SimulationScreen', 'useEffect running');
    loadSimulationState();
  }, []);

  const loadSimulationState = async () => {
    Debug.trace('SimulationScreen', 'loadSimulationState start');
    try {
      const state = await SimulationService.getState();
      Debug.log('SimulationScreen state:', state);
      setSimulation(state);
      setEditingVersion(state.appVersion);
      Debug.trace('SimulationScreen', 'loadSimulationState complete');
    } catch (error) {
      Debug.error('SimulationScreen loadSimulationState error:', error);
    }
  };

  const toggleSimulation = async (enabled: boolean) => {
    Debug.trace('SimulationScreen', `toggleSimulation: ${enabled}`);
    try {
      await SimulationService.setEnabled(enabled);
      await loadSimulationState();
    } catch (error) {
      Debug.error('SimulationScreen toggleSimulation error:', error);
    }
  };

  const handleVersionChange = async () => {
    Debug.trace('SimulationScreen', `handleVersionChange: ${editingVersion}`);
    try {
      if (editingVersion !== simulation.appVersion) {
        await SimulationService.setAppVersion(editingVersion);
        await SimulationService.setBuildDate(new Date().toISOString());
        await loadSimulationState();
      }
    } catch (error) {
      Debug.error('SimulationScreen handleVersionChange error:', error);
    }
  };

  const handleResetSimulation = async () => {
    Debug.trace('SimulationScreen', 'handleResetSimulation');
    Alert.alert(
      'Resetear Simulación',
      '¿Volver a la versión real de la app y reiniciar contadores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SimulationService.reset();
              await loadSimulationState();
            } catch (error) {
              Debug.error('SimulationScreen reset error:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '-';
    try {
      return new Date(isoDate).toLocaleString();
    } catch {
      return isoDate;
    }
  };

  Debug.trace('SimulationScreen', 'About to render JSX');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.card, simulation.enabled && styles.cardActive]}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>Activar Simulación</Text>
            <Text style={styles.switchDescription}>
              {simulation.enabled ? 'Usando versión simulada' : 'Usando versión real de la APK'}
            </Text>
          </View>
          <Switch
            value={simulation.enabled}
            onValueChange={toggleSimulation}
            trackColor={{ false: '#ccc', true: COLORS.GREEN_LIGHT }}
            thumbColor={simulation.enabled ? COLORS.GREEN : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Versiones</Text>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Versión Real (APK):</Text>
          <Text style={styles.versionValueFixed}>{simulation.realAppVersion}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.editVersionRow}>
          <Text style={styles.versionLabel}>Versión Simulada:</Text>
          <TextInput
            style={[styles.versionInput, !simulation.enabled && styles.inputDisabled]}
            value={editingVersion}
            onChangeText={setEditingVersion}
            onBlur={handleVersionChange}
            placeholder="1.0.0"
            keyboardType="decimal-pad"
            editable={simulation.enabled}
          />
        </View>

        {!simulation.enabled && (
          <Text style={styles.disabledHint}>
            Activa la simulación para editar la versión
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información</Text>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Fecha de "Compilación":</Text>
          <Text style={styles.versionValue}>{formatDate(simulation.buildDate)}</Text>
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Instalaciones Simuladas:</Text>
          <Text style={styles.versionValue}>{simulation.installCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <View style={[
            styles.statusBadge,
            simulation.enabled ? styles.statusActive : styles.statusInactive
          ]}>
            <Text style={styles.statusText}>
              {simulation.enabled ? 'SIMULACIÓN ACTIVA' : 'MODO NORMAL'}
            </Text>
          </View>
        </View>
      </View>

      {simulation.enabled && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSimulation}
        >
          <Text style={styles.resetButtonText}>Resetear Simulación</Text>
        </TouchableOpacity>
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
    paddingBottom: 32,
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
  cardActive: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ORANGE,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  switchDescription: {
    fontSize: 12,
    color: COLORS.GRAY_MEDIUM,
    marginTop: 2,
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
  versionValueFixed: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY,
  },
  editVersionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionInput: {
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'center',
    backgroundColor: COLORS.WHITE,
  },
  inputDisabled: {
    borderColor: '#ddd',
    backgroundColor: COLORS.GRAY_LIGHT,
    color: COLORS.GRAY,
  },
  disabledHint: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: COLORS.GREEN,
  },
  statusInactive: {
    backgroundColor: COLORS.GRAY,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
