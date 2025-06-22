import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientService, PatientWithUser } from '../../../services/patients';
import { authService } from '../../../services/auth';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { rewardsService, Reward } from '../../../services/rewards';

const quickAccessItems = [
  {
    title: 'Citas',
    icon: 'calendar-check' as const,
    route: '/(tabs)/patient/appointments' as const,
  },
  {
    title: 'Recompensas',
    icon: 'gift' as const,
    route: '/(tabs)/patient/rewards' as const,
  },
  {
    title: 'Tareas',
    icon: 'clipboard-list' as const,
    route: '/(tabs)/patient/assignments' as const,
  },
];

const getIconForReward = (rewardName: string) => {
    const name = rewardName.toLowerCase();
    if (name.includes('consulta') || name.includes('análisis') || name.includes('nutricional')) return 'stethoscope';
    if (name.includes('descuento') || name.includes('bono')) return 'tag';
    if (name.includes('kit') || name.includes('termo')) return 'box-open';
    if (name.includes('charla') || name.includes('acceso')) return 'calendar-alt';
    if (name.includes('yoga') || name.includes('gimnasio')) return 'dumbbell';
    if (name.includes('masaje')) return 'spa';
    return 'gift';
};

const learnTopics = [
  {
    id: 'heart',
    title: 'Cuida tu Corazón',
    icon: 'heartbeat' as const,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    content: 'Las enfermedades cardiovasculares son la principal causa de muerte en el mundo. Mantener un estilo de vida activo, una dieta equilibrada baja en grasas saturadas y sal, y no fumar son los pilares para proteger tu corazón. ¡Realiza chequeos regulares!'
  },
  {
    id: 'diabetes',
    title: 'Prevén la Diabetes',
    icon: 'tint' as const,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    content: 'La diabetes tipo 2 es en gran medida prevenible. Reducir el consumo de azúcar y carbohidratos refinados, aumentar la actividad física y mantener un peso saludable pueden reducir tu riesgo drásticamente. ¡Una dieta rica en fibra es tu aliada!'
  },
  {
    id: 'mental',
    title: 'Cuida tu Bienestar Mental',
    icon: 'brain' as const,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    content: 'Tu salud mental es tan importante como tu salud física. Practicar la meditación, dormir lo suficiente, y mantener relaciones sociales saludables son pasos clave para un bienestar integral. ¡No estás solo!'
  }
];

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState<PatientWithUser | null>(null);
  const [highlightedRewards, setHighlightedRewards] = useState<Reward[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<(typeof learnTopics)[0] | null>(null);

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
      const [patient, rewards] = await Promise.all([
        patientService.getCurrentPatient(),
        rewardsService.getRewards(),
      ]);
      setPatientData(patient);
      setHighlightedRewards(rewards.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const openModal = (topic: (typeof learnTopics)[0]) => {
    setSelectedTopic(topic);
    setModalVisible(true);
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
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>
            ¡Bienvenid@, {userName}!
          </Text>
          <Text style={styles.subtitle}>Cuida tu salud y gana puntos</Text>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.quickAccessContainer}>
          {quickAccessItems.map((item) => (
            <TouchableOpacity 
              key={item.title} 
              style={styles.quickAccessButton} 
              onPress={() => router.push(item.route as any)}
            >
              <FontAwesome5 name={item.icon} size={24} color={Colors.primary.main} />
              <Text style={styles.quickAccessText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
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

        <View style={styles.highlightSection}>
          <View style={styles.highlightTitleContainer}>
            <FontAwesome5 name="gift" size={16} color={Colors.grey[700]} />
            <Text style={styles.highlightTitle}>Recompensas para ti</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20 }}
          >
            {highlightedRewards.map(reward => (
              <TouchableOpacity 
                key={reward.id_recompensa} 
                style={styles.rewardCard}
                onPress={() => router.push('/(tabs)/patient/rewards')}
              >
                <View style={styles.rewardIconContainer}>
                  <FontAwesome5 name={getIconForReward(reward.nombre)} size={20} color={Colors.light.background} />
                </View>
                <Text style={styles.rewardCardTitle} numberOfLines={2}>{reward.nombre}</Text>
                <Text style={styles.rewardCardPoints}>{reward.puntos_necesarios.toLocaleString()} pts</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.infoCard, { backgroundColor: Colors.primary.main, marginTop: 20 }]}>
          <View style={styles.infoCardHeader}>
            <FontAwesome5 name="tasks" size={20} color={Colors.primary.contrast} />
            <Text style={styles.infoCardTitle}>Tareas Pendientes</Text>
          </View>
          <Text style={styles.infoCardSubtitle}>No tienes tareas pendientes. ¡Buen trabajo!</Text>
          <TouchableOpacity 
            style={styles.infoCardButton}
            onPress={() => router.push('/(tabs)/patient/assignments')}
          >
            <Text style={[styles.infoCardButtonText, { color: Colors.primary.main }]}>Ver Tareas</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.infoCard, { backgroundColor: Colors.secondary.main }]}>
          <View style={styles.infoCardHeader}>
            <MaterialIcons name="event" size={22} color={Colors.secondary.contrast} />
            <Text style={styles.infoCardTitle}>Citas Agendadas</Text>
          </View>
          <Text style={styles.infoCardSubtitle}>No tienes citas agendadas próximamente.</Text>
          <TouchableOpacity 
            style={styles.infoCardButton}
            onPress={() => router.push('/(tabs)/patient/appointments')}
          >
            <Text style={[styles.infoCardButtonText, { color: Colors.secondary.main }]}>Ver Citas</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.learnSection}>
          <View style={styles.highlightTitleContainer}>
            <FontAwesome5 name="heart" solid size={16} color={Colors.grey[700]} />
            <Text style={styles.highlightTitle}>Aprende a Cuidarte</Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            {learnTopics.map((topic) => (
              <TouchableOpacity 
                key={topic.id} 
                style={[styles.learnCard, { backgroundColor: topic.bgColor }]}
                onPress={() => openModal(topic)}
              >
                <View style={[styles.learnIconContainer, { backgroundColor: topic.color }]}>
                  <FontAwesome5 name={topic.icon} size={22} color="#fff" />
                </View>
                <Text style={[styles.learnCardTitle, { color: topic.color }]}>{topic.title}</Text>
                <Text style={styles.learnCardLink}>Ver más →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
      </ScrollView>

      {selectedTopic && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconContainer, { backgroundColor: selectedTopic.color }]}>
                  <FontAwesome5 name={selectedTopic.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
              </View>
              <Text style={styles.modalContent}>{selectedTopic.content}</Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: selectedTopic.color }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    color: Colors.grey[700],
    fontFamily: 'SpaceMono',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.grey[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.primary.main,
  },
  welcomeContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginTop: 4,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginLeft: 10,
    marginRight: 20,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: Colors.grey[100],
    marginBottom: 10,
  },
  quickAccessButton: {
    alignItems: 'center',
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.grey[700],
    fontWeight: '500',
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
  highlightSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  highlightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[800],
    marginLeft: 10,
  },
  rewardCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.grey[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rewardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey[800],
    textAlign: 'center',
    height: 34,
  },
  rewardCardPoints: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginTop: 8,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    color: Colors.primary.contrast,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCardSubtitle: {
    color: Colors.primary.contrast,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
  },
  infoCardButton: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoCardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  learnSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  learnCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#ff00ff',
  },
  learnIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  learnCardTitle: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  learnCardLink: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: Colors.grey[600],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.grey[600],
    marginBottom: 30,
    lineHeight: 24,
  },
  modalCloseButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    elevation: 2,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
}); 