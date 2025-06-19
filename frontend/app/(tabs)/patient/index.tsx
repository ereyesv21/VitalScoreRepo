import { View, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { patientService, PatientWithUser } from '../../../services/patients';
import { authService } from '../../../services/auth';

export default function PatientHome() {
    const [patient, setPatient] = useState<PatientWithUser | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load both patient data and user data
            const [patientData, userData] = await Promise.all([
                patientService.getCurrentPatient(),
                authService.getCurrentUser(),
            ]);
            
            setPatient(patientData);
            setUser(userData);
        } catch (error) {
            Alert.alert(
                'Error',
                'No se pudo cargar la información del paciente.'
            );
            console.error('Error loading patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleViewMore = () => {
        Alert.alert('Ver más', 'Aquí verás más detalles sobre tu cita');
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialCommunityIcons name="loading" size={48} color={Colors.primary.dark} />
                <ThemedText style={{ marginTop: 16, fontSize: 16 }}>Cargando...</ThemedText>
            </View>
        );
    }

    const displayName = user?.nombre && user?.apellido 
        ? `${user.nombre} ${user.apellido}`
        : patient?.usuario_data?.nombre && patient?.usuario_data?.apellido
        ? `${patient.usuario_data.nombre} ${patient.usuario_data.apellido}`
        : 'Paciente';

    const vitalScore = patient?.vitalScore || patient?.puntos || 0;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <LinearGradient
                    colors={[Colors.primary.dark, Colors.primary.medium]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <ThemedText style={styles.greeting}>
                                ¡Hola, {displayName}!
                            </ThemedText>
                            <ThemedText style={styles.date}>
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
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

                    {/* Header Stats */}
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="heart-pulse" size={24} color={Colors.text.light} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>
                                    {vitalScore}
                                </ThemedText>
                                <ThemedText style={styles.statLabel}>VitalScore</ThemedText>
                            </View>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="calendar-check" size={24} color={Colors.text.light} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>3</ThemedText>
                                <ThemedText style={styles.statLabel}>Tareas completadas</ThemedText>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.content}>
                {/* Sección 1: Plan de tratamiento */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Plan de Tratamiento</ThemedText>
                    <View style={styles.treatmentCard}>
                        <View style={styles.treatmentItem}>
                            <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
                            <ThemedText style={styles.treatmentText}>Tomar medicamento A</ThemedText>
                            <ThemedText style={styles.treatmentTime}>08:00 AM</ThemedText>
                        </View>
                        <View style={styles.treatmentItem}>
                            <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.treatmentText}>Cita con el cardiólogo</ThemedText>
                            <ThemedText style={styles.treatmentTime}>15 de junio</ThemedText>
                        </View>
                        <View style={styles.treatmentItem}>
                            <MaterialCommunityIcons name="run" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.treatmentText}>Ejercicio diario</ThemedText>
                            <ThemedText style={styles.treatmentTime}>17:00 PM</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Sección 2: Recompensas */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Recompensas</ThemedText>
                    <View style={styles.rewardsCard}>
                        <View style={styles.rewardInfo}>
                            <MaterialCommunityIcons 
                                name="medal-outline" 
                                size={48} 
                                color={Colors.primary.dark} 
                            />
                            <View style={styles.rewardDetails}>
                                <ThemedText style={styles.rewardText}>
                                    Completá 5 días seguidos para ganar una medalla
                                </ThemedText>
                                <ThemedText style={styles.streakText}>
                                    3 días consecutivos
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Sección 3: Próxima cita */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Próxima Cita</ThemedText>
                    <Pressable style={styles.appointmentCard} onPress={handleViewMore}>
                        <View style={styles.appointmentInfo}>
                            <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary.dark} />
                            <View style={styles.appointmentDetails}>
                                <ThemedText style={styles.appointmentTitle}>
                                    Nutricionista
                                </ThemedText>
                                <ThemedText style={styles.appointmentTime}>
                                    20 de junio - 10:00 AM
                                </ThemedText>
                                <ThemedText style={styles.appointmentLocation}>
                                    Clínica Central
                                </ThemedText>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary.dark} />
                    </Pressable>
                </View>

                {/* Sección 4: Consejos de salud */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Consejos de Salud</ThemedText>
                    <View style={styles.tipsContainer}>
                        <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="water" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.tipText}>Toma 8 vasos de agua al día</ThemedText>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="run" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.tipText}>Haz 30 min de ejercicio</ThemedText>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="sleep" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.tipText}>Duerme 8 horas</ThemedText>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialCommunityIcons name="food-apple" size={24} color={Colors.primary.dark} />
                            <ThemedText style={styles.tipText}>Come frutas y verduras</ThemedText>
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
  treatmentCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  treatmentText: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  treatmentTime: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
}); 