import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRole = await AsyncStorage.getItem('userRole');

      if (token && userRole) {
        // Usuario autenticado, redirigir según el rol
        if (userRole === 'paciente') {
          router.replace('/(tabs)/patient/');
        } else if (userRole === 'medico') {
          router.replace('/(tabs)/doctor/');
        } else {
          // Rol no reconocido, ir a login
          router.replace('/auth/login');
        }
      } else {
        // No autenticado, ir a login
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, ir a login
      router.replace('/auth/login');
    }
  };

  return null; // No renderiza nada mientras verifica la autenticación
} 