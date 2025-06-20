import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatientDashboard() {
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
        <Text style={styles.title}>Dashboard del Paciente</Text>
        <Text style={styles.subtitle}>Bienvenido a VitalScore</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Tu VitalScore</Text>
          <Text style={styles.score}>1,250 puntos</Text>
          <Text style={styles.cardDescription}>
            ¡Sigue completando tareas para ganar más puntos!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Tareas Pendientes</Text>
          <Text style={styles.taskCount}>3 tareas por completar</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ver Tareas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Próxima Cita</Text>
          <Text style={styles.appointmentText}>Dr. García - Cardiología</Text>
          <Text style={styles.appointmentDate}>15 de junio, 10:00 AM</Text>
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
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.grey[600],
  },
  taskCount: {
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
  appointmentText: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.grey[600],
  },
  logoutButton: {
    backgroundColor: Colors.error.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.error.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
}); 