//╔═══════════════════════════════════════════════════════════╗
//║       ██╗ ██████╗ ██████╗ ███████╗██████╗ ███████╗        ║
//║       ██║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝        ║
//║       ██║██║   ██║██████╔╝█████╗  ██████╔╝███████╗        ║
//║  ██   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗╚════██║        ║
//║  ╚█████╔╝╚██████╔╝██████╔╝███████╗██║  ██║███████║        ║
//║   ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝        ║
//╚═══════════════════════════════════════════════════════════╝
//10-12-2025: _layout.tsx
//Autor: Ramón San Félix Ramón
//Email: rsanfelix@jobers.net
//Teléfono: 626 99 09 26

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Debug } from '../utils/Debug';

Debug.trace('_layout.tsx', 'File loaded');

// Colores Jobers
const COLORS = {
  GREEN: '#228B22',
  GREEN_DARK: '#1a6b1a',
  ORANGE: '#FF6200',
  WHITE: '#fff',
  GRAY: '#999',
};

export default function AppLayout() {
  Debug.trace('AppLayout', 'Component rendering');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.GREEN,
        tabBarInactiveTintColor: COLORS.GRAY,
        headerStyle: {
          backgroundColor: COLORS.GREEN,
        },
        headerTintColor: COLORS.WHITE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'API',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="update"
        options={{
          title: 'Actualizar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="download-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: 'Simular',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
