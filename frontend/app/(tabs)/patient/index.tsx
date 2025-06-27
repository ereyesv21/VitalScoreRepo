import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Dimensions, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { router, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientService, PatientWithUser } from '../../../services/patients';
import { authService } from '../../../services/auth';
import { useAuth } from '../../../hooks/useAuth';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { rewardsService, Reward } from '../../../services/rewards';
import { appointmentsService } from '../../../services/appointments';
import { tasksService, tareasPacienteService, TareaPaciente } from '../../../services/tasks';

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
  },
  {
    id: 'epoc',
    title: 'Prevén la EPOC',
    icon: 'lungs' as const,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    content: 'La Enfermedad Pulmonar Obstructiva Crónica (EPOC) es prevenible evitando el tabaquismo y la exposición a contaminantes. Si tienes tos crónica o dificultad para respirar, consulta a tu médico.'
  },
  {
    id: 'cancer',
    title: 'Prevención del Cáncer',
    icon: 'ribbon' as const,
    color: '#f59e42',
    bgColor: 'rgba(245, 158, 66, 0.1)',
    content: 'Muchos tipos de cáncer pueden prevenirse con chequeos regulares, evitando el tabaco, el alcohol y manteniendo una dieta saludable. La detección temprana salva vidas.'
  },
  {
    id: 'renal',
    title: 'Salud Renal',
    icon: 'tint-slash' as const,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    content: 'La enfermedad renal crónica puede prevenirse controlando la presión arterial, el azúcar en sangre y evitando el uso excesivo de medicamentos sin receta. Bebe suficiente agua y hazte chequeos periódicos.'
  },
  {
    id: 'cerebrovascular',
    title: 'Prevén Enfermedad Cerebrovascular',
    icon: 'brain' as const,
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    content: 'Los accidentes cerebrovasculares pueden prevenirse controlando la hipertensión, el colesterol y evitando el sedentarismo. Reconoce los síntomas de alarma y actúa rápido.'
  },
];

export default function PatientDashboard() {
  const { logout } = useAuth();
  const [patientData, setPatientData] = useState<PatientWithUser | null>(null);
  const [highlightedRewards, setHighlightedRewards] = useState<Reward[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<(typeof learnTopics)[0] | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [pendingTasks, setPendingTasks] = useState<TareaPaciente[]>([]);
  const [showWebLogoutModal, setShowWebLogoutModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
    fetchUpcomingAppointments();
  }, []);

  // Recarga automática cada 20 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 1200000); // 20 minutos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (patientData?.id_paciente) {
      fetchCompletedTasks(patientData.id_paciente);
      fetchPendingTasks(patientData.id_paciente);
    }
  }, [patientData?.id_paciente]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Cargar nombre de usuario desde AsyncStorage para una bienvenida inmediata
      const userDataString = await AsyncStorage.getItem('user');
      console.log('[loadDashboardData] userDataString:', userDataString);
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

  const fetchCompletedTasks = async (patientId: number) => {
    try {
      const tasks = await tasksService.getCompletedTasksByPatient(patientId);
      setCompletedTasks(tasks);
      setConsecutiveDays(calculateConsecutiveDays(tasks));
    } catch (error) {
      setCompletedTasks([]);
      setConsecutiveDays(0);
    }
  };

  const fetchPendingTasks = async (patientId: number) => {
    try {
      const tasks = await tareasPacienteService.getTareasPorPaciente(patientId);
      const pendientes = tasks.filter((t: TareaPaciente) => t.estado === 'pendiente');
      setPendingTasks(pendientes);
    } catch {
      setPendingTasks([]);
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

  const fetchUpcomingAppointments = async () => {
    try {
      const citas = await appointmentsService.getMyAppointments();
      const now = new Date();
      // Filtrar solo citas futuras y ordenarlas por fecha y hora
      const futuras = (Array.isArray(citas) ? citas : [])
        .filter((c: any) => {
          const fechaHora = new Date(`${c.fecha_cita}T${c.hora_inicio}`);
          return fechaHora >= now;
        })
        .sort((a: any, b: any) => {
          const fechaA = new Date(`${a.fecha_cita}T${a.hora_inicio}`);
          const fechaB = new Date(`${b.fecha_cita}T${b.hora_inicio}`);
          return fechaA.getTime() - fechaB.getTime();
        })
        .slice(0, 3); // Solo las próximas 3
      setUpcomingAppointments(futuras);
    } catch {
      setUpcomingAppointments([]);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      setShowWebLogoutModal(true);
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
                router.replace('/auth/login');
              } catch (error) {
                Alert.alert('Error', 'No se pudo cerrar la sesión. Inténtalo de nuevo.');
              }
            },
          },
        ]
      );
    }
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

        {/* Tarjeta grande de Tu VitalScore */}
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
          {pendingTasks.length === 0 ? (
            <Text style={styles.infoCardSubtitle}>No tienes tareas pendientes. ¡Buen trabajo!</Text>
          ) : (
            <Text style={styles.infoCardSubtitle}>
              Tienes {pendingTasks.length} tarea{pendingTasks.length > 1 ? 's' : ''} pendiente{pendingTasks.length > 1 ? 's' : ''}.
            </Text>
          )}
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
          {upcomingAppointments.length === 0 ? (
            <Text style={styles.infoCardSubtitle}>No tienes citas agendadas próximamente.</Text>
          ) : (
            upcomingAppointments.map((cita, i) => (
              <View key={cita.id_cita || i} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: Colors.secondary.main }}>
                  Médico: {cita.medico_data ? `${cita.medico_data.nombre} ${cita.medico_data.apellido}` : ''}
                </Text>
                {cita.medico_data?.especialidad && (
                  <Text style={{ color: Colors.secondary.main }}>
                    Especialidad: {cita.medico_data.especialidad}
                  </Text>
                )}
                <Text style={{ color: Colors.grey[800] }}>
                  Fecha: {cita.fecha_cita} - {cita.hora_inicio}
                </Text>
                <Text style={{ color: Colors.grey[800] }}>
                  Estado: {cita.estado === 'cancelada' ? 'Cancelado' : cita.estado}
                </Text>
              </View>
            ))
          )}
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

      {/* Modal de logout para web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showWebLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWebLogoutModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', minWidth: 280 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>¿Cerrar sesión?</Text>
              <Text style={{ marginBottom: 24 }}>¿Estás seguro de que quieres cerrar sesión?</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => setShowWebLogoutModal(false)}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    setShowWebLogoutModal(false);
                    await logout();
                    router.replace('/auth/login');
                  }}
                >
                  <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
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