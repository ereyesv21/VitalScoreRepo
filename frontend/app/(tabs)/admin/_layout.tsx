import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

export default function AdminStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="doctors" options={{ headerShown: false }} />
      <Stack.Screen name="schedules" options={{ headerShown: false }} />
    </Stack>
  );
} 