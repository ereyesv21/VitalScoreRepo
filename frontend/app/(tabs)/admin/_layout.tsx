import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { AdminRoute } from '../../../components/ProtectedRoute';

export default function AdminLayout() {
  return (
    <AdminRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary.main,
          tabBarInactiveTintColor: Colors.grey[500],
          tabBarStyle: {
            backgroundColor: Colors.light.background,
            borderTopColor: Colors.grey[200],
          },
          headerStyle: {
            backgroundColor: Colors.primary.main,
          },
          headerTintColor: Colors.light.background,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            title: 'Médicos',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="medical-services" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: 'Pacientes',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            title: 'Citas',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="event" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reportes',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="assessment" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AdminRoute>
  );
} 