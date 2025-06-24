import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function TabLayout() {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // El ProtectedRoute se encargará del loading
  }

  if (!isAuthenticated) {
    return null; // El ProtectedRoute redirigirá al login
  }

  // Renderizar tabs según el rol
  if (role === 'administrador') {
    return (
      <ProtectedRoute allowedRoles={['administrador']}>
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
            name="admin"
            options={{
              title: 'Administrador',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="admin-panel-settings" size={size} color={color} />
              ),
              href: null, // Ocultar esta tab, las sub-tabs se manejan en admin/_layout.tsx
            }}
          />
        </Tabs>
      </ProtectedRoute>
    );
  }

  if (role === 'medico') {
    return (
      <ProtectedRoute allowedRoles={['medico']}>
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
            name="doctor"
            options={{
              title: 'Médico',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="medical-services" size={size} color={color} />
              ),
              href: null, // Ocultar esta tab, las sub-tabs se manejan en doctor/_layout.tsx
            }}
          />
        </Tabs>
      </ProtectedRoute>
    );
  }

  // Rol por defecto: paciente
  return (
    <ProtectedRoute allowedRoles={['paciente']}>
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
          name="patient"
          options={{
            title: 'Paciente',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
            href: null, // Ocultar esta tab, las sub-tabs se manejan en patient/_layout.tsx
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
} 