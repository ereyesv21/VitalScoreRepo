import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorDashboard() {
  const handleLogout = async () => {
    console.log('Botón Salir presionado. Mostrando alerta...');
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión.');
            }
          },
        },
      ]
    );
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
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <View style={styles.logoutButtonContent}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.background} />
            <Text style={styles.logoutButtonText}>Salir</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  logoutContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  logoutButton: {
    backgroundColor: Colors.error.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 