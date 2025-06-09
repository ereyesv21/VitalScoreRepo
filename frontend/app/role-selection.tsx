import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { Colors } from '../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RoleSelection() {
  const router = useRouter();

  const handleRoleSelection = (role: 'patient' | 'doctor') => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Bienvenido a VitalScore</ThemedText>
        <ThemedText style={styles.subtitle}>Selecciona tu rol para continuar</ThemedText>
      </View>

      <View style={styles.rolesContainer}>
        <Pressable
          style={[styles.roleCard, { backgroundColor: Colors.primary.dark }]}
          onPress={() => handleRoleSelection('patient')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account" size={48} color={Colors.text.light} />
          </View>
          <ThemedText style={styles.roleTitle}>Paciente</ThemedText>
          <ThemedText style={styles.roleDescription}>
            Accede a tus asignaciones y seguimiento médico
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.roleCard, { backgroundColor: Colors.primary.medium }]}
          onPress={() => handleRoleSelection('doctor')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="doctor" size={48} color={Colors.text.light} />
          </View>
          <ThemedText style={styles.roleTitle}>Médico</ThemedText>
          <ThemedText style={styles.roleDescription}>
            Gestiona tus pacientes y sus tratamientos
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.light,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  rolesContainer: {
    gap: 20,
    paddingHorizontal: 10,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: Colors.text.light,
    textAlign: 'center',
    opacity: 0.9,
  },
}); 