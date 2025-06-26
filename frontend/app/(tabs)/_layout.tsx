import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const { role, isAuthenticated, loading } = useAuth();

  console.log('TabLayout render, role:', role, 'isAuthenticated:', isAuthenticated, 'loading:', loading);

  // Mostrar un loader mientras loading es true
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.grey[600] }}>Cargando autenticación...</Text>
      </View>
    );
  }

  // Si no está autenticado, no renderizar nada (ProtectedRoute se encarga de redirigir)
  if (!isAuthenticated) return null;

  // Renderizar solo cuando loading es false y autenticado
  return (
    <ProtectedRoute allowedRoles={['administrador', 'medico', 'paciente']}>
      <Stack screenOptions={{ headerShown: false }}>
        {role === 'administrador' && <Stack.Screen name="admin" />}
        {role === 'medico' && <Stack.Screen name="doctor" />}
        {role === 'paciente' && <Stack.Screen name="patient" />}
      </Stack>
    </ProtectedRoute>
  );
} 