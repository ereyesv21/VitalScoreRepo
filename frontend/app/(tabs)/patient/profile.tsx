import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { patientService, PatientWithUser } from '../../../services/patients';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { tasksService } from '../../../services/tasks';

export default function PatientProfile() {
  const [patientData, setPatientData] = useState<PatientWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  useEffect(() => {
    loadPatientData();
  }, []);

  // Recarga automática cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadPatientData();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (patientData?.id_paciente) {
      fetchCompletedTasks(patientData.id_paciente);
    }
  }, [patientData?.id_paciente]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const data = await patientService.getCurrentPatient();
      setPatientData(data);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del paciente');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTasks = async (patientId: number) => {
    try {
      const tasks = await tasksService.getCompletedTasksByPatient(patientId);
      console.log('Tareas completadas recibidas:', tasks);
      setCompletedTasks(tasks);
      const dias = calculateConsecutiveDays(tasks);
      console.log('Días consecutivos calculados:', dias);
      setConsecutiveDays(dias);
    } catch (error) {
      setCompletedTasks([]);
      setConsecutiveDays(0);
    }
  };

  // Calcula los días consecutivos a partir de las fechas de las tareas completadas
  const calculateConsecutiveDays = (tasks: any[]): number => {
    if (!tasks || tasks.length === 0) return 0;
    // Obtener fechas únicas de tareas completadas (en formato yyyy-mm-dd)
    const datesSet = new Set(
      tasks.map((t) => t.fecha_completada?.slice(0, 10) || t.fecha_fin?.slice(0, 10)).filter(Boolean)
    );
    const dates = Array.from(datesSet).sort();
    if (dates.length === 0) return 0;
    // Convertir a objetos Date
    const dateObjs = dates.map((d) => new Date(d + 'T00:00:00'));
    // Calcular racha desde el día más reciente hacia atrás
    let streak = 1;
    for (let i = dateObjs.length - 1; i > 0; i--) {
      const diff = (dateObjs[i].getTime() - dateObjs[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else if (diff > 1) {
        break;
      }
    }
    // Si la última fecha no es hoy, la racha se corta
    const today = new Date();
    const lastDate = dateObjs[dateObjs.length - 1];
    if (
      lastDate.getFullYear() !== today.getFullYear() ||
      lastDate.getMonth() !== today.getMonth() ||
      lastDate.getDate() !== today.getDate()
    ) {
      // La racha terminó antes de hoy
      return streak - 1 >= 0 ? streak - 1 : 0;
    }
    return streak;
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userData');
      // @ts-ignore
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!patientData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información del paciente</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPatientData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={40} color={Colors.primary.contrast} />
          </View>
          <Text style={styles.name}>
            {patientData.usuario_data?.nombre} {patientData.usuario_data?.apellido}
          </Text>
          <Text style={styles.email}>{patientData.usuario_data?.correo}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <MaterialIcons name="person-outline" size={22} color={Colors.primary.main} />
            <Text style={styles.cardTitle}>Información Personal</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{patientData.usuario_data?.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Apellido:</Text>
            <Text style={styles.infoValue}>{patientData.usuario_data?.apellido}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>{patientData.usuario_data?.genero}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EPS:</Text>
            <Text style={styles.infoValue}>{patientData.eps_data?.nombre}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(tabs)/patient/edit-profile')}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>

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
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grey[800],
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.grey[600],
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[800],
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.grey[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.grey[800],
  },
  editButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey[600],
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error?.main || '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  retryButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.error?.main || '#dc2626',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
}); 