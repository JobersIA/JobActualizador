//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: help.tsx
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Debug } from '../utils/Debug';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

Debug.trace('help.tsx', 'File loaded');

export default function HelpScreen() {
  Debug.trace('HelpScreen', 'Component function called');

  const [activeSlide, setActiveSlide] = useState(0);
  const carouselWidth = SCREEN_WIDTH - 32;

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
    setActiveSlide(slideIndex);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Qué es el Modo Simulación?</Text>
        <Text style={styles.infoText}>
          Permite probar el sistema de actualización sin recompilar la app.
          Puedes cambiar la versión "simulada" y probar diferentes escenarios
          de actualización con la misma APK instalada.
        </Text>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Escenarios de Prueba</Text>

        <View style={styles.helpItem}>
          <Text style={styles.helpBullet}>1.</Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Actualización disponible:</Text> Pon versión simulada menor que VersionActual en la API
          </Text>
        </View>

        <View style={styles.helpItem}>
          <Text style={styles.helpBullet}>2.</Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Actualización forzada:</Text> Pon versión simulada menor que VersionMinima en la API
          </Text>
        </View>

        <View style={styles.helpItem}>
          <Text style={styles.helpBullet}>3.</Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>App actualizada:</Text> Pon versión simulada igual o mayor que VersionActual
          </Text>
        </View>
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          <View style={[styles.carouselCard, { width: carouselWidth }]}>
            <Text style={styles.cardTitle}>Endpoints de la API</Text>

            <View style={styles.endpointRow}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/version</Text>
            </View>
            <Text style={styles.endpointDesc}>Info de la API y versión mínima del cliente</Text>

            <View style={styles.endpointRow}>
              <Text style={styles.endpointMethod}>GET</Text>
              <Text style={styles.endpointPath}>/api/Sistema/GetAppVersion/Android</Text>
            </View>
            <Text style={styles.endpointDesc}>Info de actualización disponible</Text>

            <View style={styles.endpointRow}>
              <Text style={styles.endpointMethod}>POST</Text>
              <Text style={styles.endpointPath}>/api/Sistema/ReloadConfig</Text>
            </View>
            <Text style={styles.endpointDesc}>Recarga config desde appsettings.json</Text>
          </View>

          <View style={[styles.carouselCard, { width: carouselWidth }]}>
            <Text style={styles.cardTitle}>Configuración de la API</Text>

            <Text style={styles.sectionTitle}>appsettings.json</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>ApiVersion:</Text>
              <Text style={styles.codeItem}>  CompatibleVersions: ["1.0.0"]</Text>
              <Text style={styles.codeItem}>  MinClientVersion: "1.0.0"</Text>
              <Text style={styles.codeText}>{'\n'}AppVersions.Android:</Text>
              <Text style={styles.codeItem}>  VersionActual: "1.0.1"</Text>
              <Text style={styles.codeItem}>  VersionMinima: "1.0.0"</Text>
              <Text style={styles.codeItem}>  ActualizacionForzada: false</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.pagination}>
          <View style={[styles.dot, activeSlide === 0 && styles.dotActive]} />
          <View style={[styles.dot, activeSlide === 1 && styles.dotActive]} />
        </View>
      </View>

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
  carouselContainer: {
    marginHorizontal: -16,
  },
  carousel: {
    paddingHorizontal: 16,
  },
  carouselCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.GRAY,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.GREEN,
    width: 12,
  },
  infoCard: {
    backgroundColor: COLORS.GREEN_LIGHT,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.GREEN,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.GREEN_DARK,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
  },
  helpCard: {
    backgroundColor: COLORS.ORANGE_LIGHT,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ORANGE,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ORANGE,
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  helpBullet: {
    fontSize: 14,
    color: COLORS.ORANGE,
    fontWeight: 'bold',
    marginRight: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    flex: 1,
    lineHeight: 20,
  },
  helpBold: {
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY_MEDIUM,
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.GRAY_DARK,
  },
  codeItem: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.GRAY_MEDIUM,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  endpointMethod: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  endpointPath: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  endpointDesc: {
    fontSize: 12,
    color: COLORS.GRAY_MEDIUM,
    marginLeft: 46,
    marginBottom: 4,
  },
});
