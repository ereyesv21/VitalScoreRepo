import { View, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/role-selection');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color={Colors.text.light} />
        </View>
        <ThemedText style={styles.name}>Juan Pérez</ThemedText>
        <ThemedText style={styles.email}>paciente@paciente.com</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Información Personal</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.infoText}>+52 123 456 7890</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.infoText}>Ciudad de México, México</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.infoText}>Fecha de nacimiento: 01/01/1990</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Configuración</ThemedText>
          <View style={styles.menuCard}>
            <Pressable style={styles.menuItem}>
              <MaterialCommunityIcons name="account-edit" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.menuText}>Editar Perfil</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
            </Pressable>
            <Pressable style={styles.menuItem}>
              <MaterialCommunityIcons name="bell" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.menuText}>Notificaciones</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
            </Pressable>
            <Pressable style={styles.menuItem}>
              <MaterialCommunityIcons name="shield-lock" size={24} color={Colors.primary.dark} />
              <ThemedText style={styles.menuText}>Seguridad</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={Colors.text.light} />
          <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary.dark,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.text.light,
    opacity: 0.8,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.dark,
  },
  infoCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  menuCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.dark,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral.dark,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 