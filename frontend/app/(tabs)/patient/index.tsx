import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientService, PatientWithUser } from '../../../services/patients';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState<PatientWithUser | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Cargar nombre de usuario desde AsyncStorage para una bienvenida inmediata
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserName(userData.nombre || 'Paciente');
      }

      // Cargar el resto de los datos desde el servidor
      const data = await patientService.getCurrentPatient();
      setPatientData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          ¡Bienvenid@, {userName}!
        </Text>
        <Text style={styles.subtitle}>Aquí está tu resumen de VitalScore</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="star-outline" size={22} color={Colors.primary.main} />
            <Text style={styles.cardTitle}>Tu VitalScore</Text>
          </View>
          <Text style={styles.score}>{patientData?.puntos?.toLocaleString() || '0'} puntos</Text>
          <Text style={styles.cardDescription}>
            ¡Sigue completando tareas para ganar más puntos y canjear recompensas!
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <FontAwesome5 name="tasks" size={20} color={Colors.primary.main} />
            <Text style={styles.cardTitle}>Tareas Pendientes</Text>
          </View>
          <Text style={styles.taskCount}>3 tareas por completar</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/(tabs)/patient/assignments')}
          >
            <Text style={styles.buttonText}>Ver Tareas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="event" size={22} color={Colors.primary.main} />
            <Text style={styles.cardTitle}>Próxima Cita</Text>
          </View>
          <Text style={styles.appointmentText}>No tienes citas programadas</Text>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)/patient/appointments')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ver Citas</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.grey[600],
  },
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
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[800],
    marginLeft: 10,
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
  secondaryButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
  },
  appointmentText: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.grey[600],
  },
}); 