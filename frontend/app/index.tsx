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
      console.log('userRole en index:', userRole);
      console.log('token en index:', token);

      if (token && userRole) {
        // Usuario autenticado, redirigir según el rol
        console.log('Redirigiendo, userRole:', userRole);
        if (userRole === 'paciente') {
          console.log('Redirigiendo a /(tabs)/patient');
          router.replace('/(tabs)/patient');
        } else if (userRole === 'administrador') {
          console.log('Redirigiendo a /(tabs)/admin');
          router.replace('/(tabs)/admin');
        } else if (userRole === 'medico') {
          console.log('Redirigiendo a /(tabs)/doctor');
          router.replace('/(tabs)/doctor');
        } else {
          console.log('Rol no reconocido, redirigiendo a /auth/login');
          router.replace('/auth/login');
        }
      } else {
        // No autenticado, ir a login
        console.log('No autenticado, redirigiendo a /auth/login');
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, ir a login
      router.replace('/auth/login');
    }
  };

  console.log('Index render');
  return null; // No renderiza nada mientras verifica la autenticación
} 