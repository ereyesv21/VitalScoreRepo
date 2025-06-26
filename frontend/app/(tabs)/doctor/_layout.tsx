import { Stack } from 'expo-router';

export default function DoctorStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="appointments" options={{ headerShown: false }} />
      <Stack.Screen name="patient-profile" options={{ headerShown: false }} />
      <Stack.Screen name="assign-task" options={{ headerShown: false }} />
    </Stack>
  );
} 