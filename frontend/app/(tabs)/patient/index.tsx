import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Datos mock para simular la información
const mockData = {
  vitalScore: 78,
  treatmentPlan: [
    { id: 1, title: 'Tomar medicamento A', time: '08:00 AM', completed: true },
    { id: 2, title: 'Cita con el cardiólogo', date: '15 de junio', completed: false },
    { id: 3, title: 'Ejercicio diario', time: '17:00 PM', completed: false },
  ],
  rewards: {
    streak: 3,
    nextReward: 'Completá 5 días seguidos para ganar una medalla',
    unlocked: false,
  },
  nextAppointment: {
    specialty: 'Nutricionista',
    date: '20 de junio',
    time: '10:00 AM',
    location: 'Clínica Central',
  },
  healthTips: [
    { id: 1, icon: 'water', text: 'Toma 8 vasos de agua al día' },
    { id: 2, icon: 'run', text: 'Haz 30 min de ejercicio' },
    { id: 3, icon: 'sleep', text: 'Duerme 8 horas' },
    { id: 4, icon: 'food-apple', text: 'Come frutas y verduras' },
  ],
};

export default function PatientHome() {
  const getVitalScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const handleTaskComplete = (taskId: number) => {
    Alert.alert('Tarea completada', '¡Buen trabajo!');
  };

  const handleViewMore = () => {
    Alert.alert('Detalles de la cita', 'Aquí verás más información sobre tu próxima cita.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primary.dark, Colors.primary.medium]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <ThemedText style={styles.greeting}>Hola, Juan!</ThemedText>
              <ThemedText style={styles.date}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </ThemedText>
            </View>
            <Pressable style={styles.profileButton}>
              <View style={styles.profileImageContainer}>
                <MaterialCommunityIcons name="account-circle" size={40} color={Colors.text.light} />
                <View style={styles.notificationBadge}>
                  <ThemedText style={styles.notificationText}>2</ThemedText>
                </View>
              </View>
            </Pressable>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>3</ThemedText>
                <ThemedText style={styles.statLabel}>Tareas hoy</ThemedText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="medal" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>3</ThemedText>
                <ThemedText style={styles.statLabel}>Días seguidos</ThemedText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>78</ThemedText>
                <ThemedText style={styles.statLabel}>VitalScore</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Sección 1: Estado general */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estado General</ThemedText>
          <View style={styles.vitalScoreCard}>
            <ThemedText style={styles.vitalScoreTitle}>Tu puntuación actual</ThemedText>
            <View style={styles.scoreContainer}>
              <ThemedText style={[styles.score, { color: getVitalScoreColor(mockData.vitalScore) }]}>
                {mockData.vitalScore}
              </ThemedText>
              <ThemedText style={styles.scoreMax}>/100</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${mockData.vitalScore}%`,
                    backgroundColor: getVitalScoreColor(mockData.vitalScore)
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Sección 2: Plan de tratamiento */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Plan de Tratamiento</ThemedText>
          {mockData.treatmentPlan.map((task) => (
            <Pressable 
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleTaskComplete(task.id)}
            >
              <View style={styles.taskInfo}>
                <MaterialCommunityIcons 
                  name={task.completed ? 'check-circle' : 'circle-outline'} 
                  size={24} 
                  color={task.completed ? Colors.success : Colors.primary.dark} 
                />
                <View style={styles.taskDetails}>
                  <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
                  <ThemedText style={styles.taskTime}>
                    {task.time || task.date}
                  </ThemedText>
                </View>
              </View>
              {!task.completed && (
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Sección 3: Recompensas */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recompensas</ThemedText>
          <View style={styles.rewardsCard}>
            <View style={styles.rewardInfo}>
              <MaterialCommunityIcons 
                name={mockData.rewards.unlocked ? 'medal' : 'medal-outline'} 
                size={48} 
                color={Colors.primary.dark} 
              />
              <View style={styles.rewardDetails}>
                <ThemedText style={styles.rewardText}>{mockData.rewards.nextReward}</ThemedText>
                <ThemedText style={styles.streakText}>
                  {mockData.rewards.streak} días consecutivos
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Sección 4: Próxima cita */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Próxima Cita</ThemedText>
          <Pressable style={styles.appointmentCard} onPress={handleViewMore}>
            <View style={styles.appointmentInfo}>
              <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary.dark} />
              <View style={styles.appointmentDetails}>
                <ThemedText style={styles.appointmentTitle}>
                  {mockData.nextAppointment.specialty}
                </ThemedText>
                <ThemedText style={styles.appointmentTime}>
                  {mockData.nextAppointment.date} - {mockData.nextAppointment.time}
                </ThemedText>
                <ThemedText style={styles.appointmentLocation}>
                  {mockData.nextAppointment.location}
                </ThemedText>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
          </Pressable>
        </View>

        {/* Sección 5: Consejos de salud */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Consejos de Salud</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsContainer}>
            {mockData.healthTips.map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <MaterialCommunityIcons name={tip.icon} size={32} color={Colors.primary.dark} />
                <ThemedText style={styles.tipText}>{tip.text}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>
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
    backgroundColor: Colors.primary.dark,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    gap: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  date: {
    fontSize: 16,
    color: Colors.text.light,
    opacity: 0.8,
  },
  profileButton: {
    padding: 8,
  },
  profileImageContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.dark,
  },
  notificationText: {
    color: Colors.text.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statInfo: {
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.light,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  vitalScoreCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    alignItems: 'center',
  },
  vitalScoreTitle: {
    fontSize: 18,
    color: Colors.neutral.dark,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    color: Colors.neutral.dark,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.neutral.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskDetails: {
    gap: 4,
  },
  taskTitle: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  taskTime: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },
  rewardsCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rewardDetails: {
    flex: 1,
    gap: 8,
  },
  rewardText: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  streakText: {
    fontSize: 14,
    color: Colors.primary.dark,
    fontWeight: 'bold',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appointmentDetails: {
    gap: 4,
  },
  appointmentTitle: {
    fontSize: 16,
    color: Colors.neutral.dark,
    fontWeight: 'bold',
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.neutral.dark,
  },
  appointmentLocation: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },
  tipsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    alignItems: 'center',
    gap: 8,
    width: 160,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
}); 