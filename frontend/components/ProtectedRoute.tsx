import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/auth';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['paciente', 'medico', 'administrador'],
  fallback
}) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  // Si no tiene el rol permitido, mostrar fallback o redirigir
  if (role && !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirigir según el rol
    switch (role) {
      case 'paciente':
        router.replace('/(tabs)/patient');
        break;
      case 'medico':
        router.replace('/(tabs)/doctor');
        break;
      case 'administrador':
        // Temporalmente redirigir al login hasta que se resuelva el problema de rutas
        router.replace('/auth/login');
        break;
      default:
        router.replace('/auth/login');
    }
    return null;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

// Componente específico para rutas de administrador
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['administrador']}>
    {children}
  </ProtectedRoute>
);

// Componente específico para rutas de médico
export const DoctorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['medico']}>
    {children}
  </ProtectedRoute>
);

// Componente específico para rutas de paciente
export const PatientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['paciente']}>
    {children}
  </ProtectedRoute>
);

// Componente para rutas de médico y administrador
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['medico', 'administrador']}>
    {children}
  </ProtectedRoute>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey[600],
  },
}); 