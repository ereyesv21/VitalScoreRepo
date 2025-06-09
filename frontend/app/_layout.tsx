import { Stack, Redirect } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary.dark,
        },
        headerTintColor: Colors.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: Colors.background.light,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
        redirect={true}
      />
      <Stack.Screen
        name="role-selection"
        options={{
          title: 'Selección de Rol',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          title: 'Iniciar Sesión',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: 'Registro',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          title: 'Recuperar Contraseña',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
