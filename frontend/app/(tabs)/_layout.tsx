import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.dark,
        tabBarInactiveTintColor: Colors.neutral.dark,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.primary.dark,
        },
        headerStyle: {
          backgroundColor: Colors.primary.dark,
        },
        headerTintColor: Colors.text.light,
      }}
    >
      <Tabs.Screen
        name="patient/index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctor/index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
