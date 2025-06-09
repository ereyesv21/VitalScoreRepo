import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export default function PatientTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.dark,
        tabBarInactiveTintColor: Colors.neutral.dark,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.primary.dark,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: Colors.primary.dark,
        },
        headerTintColor: Colors.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Asignaciones',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 