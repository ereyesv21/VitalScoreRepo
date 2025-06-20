import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DoctorDashboard() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userData');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard del Médico</Text>
        <Text style={styles.subtitle}>Panel de control médico</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👥 Pacientes Activos</Text>
          <Text style={styles.patientCount}>24 pacientes</Text>
          <Text style={styles.cardDescription}>
            Pacientes bajo tu cuidado actualmente
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Citas Hoy</Text>
          <Text style={styles.appointmentCount}>8 citas programadas</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ver Citas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Estadísticas</Text>
          <Text style={styles.statsText}>Tareas completadas: 156</Text>
          <Text style={styles.statsText}>Promedio VitalScore: 1,240</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary.contrast,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.grey[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 12,
  },
  patientCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.grey[600],
  },
  appointmentCount: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: Colors.error.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
}); 