import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <View style={styles.sectionsContainer}>
        <TouchableOpacity style={styles.sectionCard} onPress={() => router.push('/(tabs)/admin/doctors')}>
          <MaterialIcons name="medical-services" size={48} color={Colors.primary.main} />
          <Text style={styles.sectionTitle}>Gestión de Médicos</Text>
          <Text style={styles.sectionDesc}>Administra, crea, edita y elimina médicos registrados en el sistema.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sectionCard, styles.sectionCardDisabled]} disabled>
          <MaterialIcons name="schedule" size={48} color={Colors.grey[400]} />
          <Text style={styles.sectionTitle}>Gestión de Horarios</Text>
          <Text style={styles.sectionDesc}>(Próximamente)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 32,
    textAlign: 'center',
  },
  sectionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 24,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    width: 220,
    minHeight: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionCardDisabled: {
    opacity: 0.6,
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.main,
    textAlign: 'center',
  },
  sectionDesc: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.grey[600],
    textAlign: 'center',
  },
}); 