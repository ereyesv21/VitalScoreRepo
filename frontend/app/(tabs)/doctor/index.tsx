import { View, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { patientService, PatientWithUser, PatientStats } from '../../../services/patients';
import { doctorService, DoctorWithUser } from '../../../services/doctors';
import { authService } from '../../../services/auth';

export default function DoctorHome() {
    const [patients, setPatients] = useState<PatientWithUser[]>([]);
    const [stats, setStats] = useState<PatientStats | null>(null);
    const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load all data in parallel
            const [patientsData, statsData, doctorData, userData] = await Promise.all([
                patientService.getAllPatients(),
                patientService.getPatientStats(),
                doctorService.getCurrentDoctor(),
                authService.getCurrentUser(),
            ]);
            
            setPatients(patientsData);
            setStats(statsData);
            setDoctor(doctorData);
            setUser(userData);
        } catch (error) {
            Alert.alert(
                'Error',
                'No se pudo cargar la información. Verifica tu conexión.'
            );
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

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
        : doctor?.usuario_data?.nombre && doctor?.usuario_data?.apellido
        ? `${doctor.usuario_data.nombre} ${doctor.usuario_data.apellido}`
        : 'Doctor';

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
                                Bienvenido, {displayName}
                            </ThemedText>
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

                    {/* Header Stats */}
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="account-group" size={24} color={Colors.text.light} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>{patients.length}</ThemedText>
                                <ThemedText style={styles.statLabel}>Pacientes</ThemedText>
                            </View>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="heart-pulse" size={24} color={Colors.text.light} />
                            <View style={styles.statInfo}>
                                <ThemedText style={styles.statValue}>
                                    {stats?.averageVitalScore || 0}
                                </ThemedText>
                                <ThemedText style={styles.statLabel}>VitalScore Promedio</ThemedText>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.content}>
                {/* Sección 1: Estado general de pacientes */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Estado de Pacientes</ThemedText>
                    {patients.length > 0 ? (
                        patients.map((patient) => (
                            <View key={patient.id_paciente} style={styles.patientCard}>
                                <View style={styles.patientInfo}>
                                    <MaterialCommunityIcons name="account" size={24} color={Colors.primary.dark} />
                                    <View style={styles.patientDetails}>
                                        <ThemedText style={styles.patientName}>
                                            {patient.usuario_data ? `${patient.usuario_data.nombre} ${patient.usuario_data.apellido}` : 'Paciente'}
                                        </ThemedText>
                                        <ThemedText style={styles.lastActivity}>
                                            Última actividad: {patient.lastActivity || 'No disponible'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View style={styles.patientStats}>
                                    <View style={styles.vitalScoreContainer}>
                                        <ThemedText style={styles.vitalScoreLabel}>VitalScore</ThemedText>
                                        <ThemedText 
                                            style={[
                                                styles.vitalScore, 
                                                { color: getRiskLevelColor(patient.riskLevel || 'medium') }
                                            ]}
                                        >
                                            {patient.vitalScore || patient.puntos || 0}
                                        </ThemedText>
                                    </View>
                                    <MaterialCommunityIcons 
                                        name="alert-circle" 
                                        size={24} 
                                        color={getRiskLevelColor(patient.riskLevel || 'medium')} 
                                    />
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-group-outline" size={48} color={Colors.neutral.medium} />
                            <ThemedText style={styles.emptyStateText}>
                                No hay pacientes asignados aún
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Sección 2: Estadísticas */}
                {stats && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Estadísticas</ThemedText>
                        <View style={styles.statsCard}>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.highCompliance}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Alto cumplimiento</ThemedText>
                                </View>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.mediumCompliance}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Medio cumplimiento</ThemedText>
                                </View>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.lowCompliance}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Bajo cumplimiento</ThemedText>
                                </View>
                            </View>
                            <View style={styles.averageScore}>
                                <ThemedText style={styles.averageScoreLabel}>Promedio VitalScore</ThemedText>
                                <ThemedText style={styles.averageScoreValue}>
                                    {stats.averageVitalScore}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.neutral.medium,
    marginTop: 16,
  },
}); 