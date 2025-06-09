import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Datos mock para simular la información
const mockData = {
  activePatients: 12,
  patients: [
    {
      id: 1,
      name: 'Juan Pérez',
      vitalScore: 85,
      lastActivity: 'Hace 2 horas',
      riskLevel: 'low',
    },
    {
      id: 2,
      name: 'Ana García',
      vitalScore: 45,
      lastActivity: 'Hace 1 día',
      riskLevel: 'high',
    },
    {
      id: 3,
      name: 'Carlos López',
      vitalScore: 72,
      lastActivity: 'Hace 3 horas',
      riskLevel: 'medium',
    },
  ],
  alerts: [
    {
      id: 1,
      type: 'medication',
      message: 'Paciente Juan Pérez no registró medicación hoy',
      time: 'Hace 2 horas',
    },
    {
      id: 2,
      type: 'vitals',
      message: 'Riesgo alto detectado en presión arterial de Ana',
      time: 'Hace 1 día',
    },
  ],
  appointments: [
    {
      id: 1,
      patientName: 'Juan Pérez',
      specialty: 'Cardiología',
      time: '10:00 AM',
      location: 'Consultorio 3',
    },
    {
      id: 2,
      patientName: 'Ana García',
      specialty: 'Nutrición',
      time: '11:30 AM',
      location: 'Consultorio 1',
    },
  ],
  statistics: {
    highCompliance: 8,
    mediumCompliance: 3,
    lowCompliance: 1,
    averageVitalScore: 75,
  },
};

export default function DoctorHome() {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.neutral.dark;
    }
  };

  const handleViewMore = (type: string) => {
    Alert.alert('Ver más', `Aquí verás más detalles sobre ${type}`);
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
              <ThemedText style={styles.greeting}>Bienvenido, Dra. Ruiz</ThemedText>
              <ThemedText style={styles.subtitle}>Panel de Control</ThemedText>
            </View>
            <Pressable style={styles.profileButton}>
              <View style={styles.profileImageContainer}>
                <MaterialCommunityIcons name="account-circle" size={40} color={Colors.text.light} />
                <View style={styles.notificationBadge}>
                  <ThemedText style={styles.notificationText}>3</ThemedText>
                </View>
              </View>
            </Pressable>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>{mockData.activePatients}</ThemedText>
                <ThemedText style={styles.statLabel}>Pacientes</ThemedText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>{mockData.appointments.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Citas hoy</ThemedText>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="alert" size={24} color={Colors.text.light} />
              <View style={styles.statInfo}>
                <ThemedText style={styles.statValue}>{mockData.alerts.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Alertas</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Sección 1: Estado general de pacientes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estado de Pacientes</ThemedText>
          {mockData.patients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientInfo}>
                <MaterialCommunityIcons name="account" size={24} color={Colors.primary.dark} />
                <View style={styles.patientDetails}>
                  <ThemedText style={styles.patientName}>{patient.name}</ThemedText>
                  <ThemedText style={styles.lastActivity}>
                    Última actividad: {patient.lastActivity}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.patientStats}>
                <View style={styles.vitalScoreContainer}>
                  <ThemedText style={styles.vitalScoreLabel}>VitalScore</ThemedText>
                  <ThemedText 
                    style={[
                      styles.vitalScore, 
                      { color: getRiskLevelColor(patient.riskLevel) }
                    ]}
                  >
                    {patient.vitalScore}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={24} 
                  color={getRiskLevelColor(patient.riskLevel)} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Sección 2: Alertas recientes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Alertas Recientes</ThemedText>
          {mockData.alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <MaterialCommunityIcons 
                name={alert.type === 'medication' ? 'pill' : 'heart-pulse'} 
                size={24} 
                color={Colors.primary.dark} 
              />
              <View style={styles.alertDetails}>
                <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
                <ThemedText style={styles.alertTime}>{alert.time}</ThemedText>
              </View>
              <Pressable onPress={() => handleViewMore('alerta')}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Sección 3: Próximas citas */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Próximas Citas</ThemedText>
          {mockData.appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentInfo}>
                <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary.dark} />
                <View style={styles.appointmentDetails}>
                  <ThemedText style={styles.appointmentPatient}>
                    {appointment.patientName}
                  </ThemedText>
                  <ThemedText style={styles.appointmentSpecialty}>
                    {appointment.specialty}
                  </ThemedText>
                  <ThemedText style={styles.appointmentTime}>
                    {appointment.time} - {appointment.location}
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={() => handleViewMore('cita')}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Sección 4: Estadísticas */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estadísticas</ThemedText>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{mockData.statistics.highCompliance}</ThemedText>
                <ThemedText style={styles.statLabel}>Alto cumplimiento</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{mockData.statistics.mediumCompliance}</ThemedText>
                <ThemedText style={styles.statLabel}>Medio cumplimiento</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{mockData.statistics.lowCompliance}</ThemedText>
                <ThemedText style={styles.statLabel}>Bajo cumplimiento</ThemedText>
              </View>
            </View>
            <View style={styles.averageScore}>
              <ThemedText style={styles.averageScoreLabel}>Promedio VitalScore</ThemedText>
              <ThemedText style={styles.averageScoreValue}>
                {mockData.statistics.averageVitalScore}
              </ThemedText>
            </View>
          </View>
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
  subtitle: {
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
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientDetails: {
    gap: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.dark,
  },
  lastActivity: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },
  patientStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vitalScoreContainer: {
    alignItems: 'center',
  },
  vitalScoreLabel: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },
  vitalScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    gap: 12,
  },
  alertDetails: {
    flex: 1,
    gap: 4,
  },
  alertMessage: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  alertTime: {
    fontSize: 14,
    color: Colors.neutral.medium,
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
  appointmentPatient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral.dark,
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: Colors.neutral.dark,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },
  statsCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageScore: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.primary.dark,
  },
  averageScoreLabel: {
    fontSize: 16,
    color: Colors.neutral.dark,
    marginBottom: 8,
  },
  averageScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.dark,
  },
}); 