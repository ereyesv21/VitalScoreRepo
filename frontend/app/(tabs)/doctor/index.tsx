import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../hooks/useAuth';
import { doctorService } from '../../../services/doctors';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'inicio' | 'perfil'>('inicio');
  const [doctorData, setDoctorData] = React.useState<any>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loadingDoctor, setLoadingDoctor] = React.useState(true);

  React.useEffect(() => {
    const fetchDoctor = async () => {
      setLoadingDoctor(true);
      try {
        const doctor = await doctorService.getCurrentDoctor();
        const appts = await doctorService.getDoctorAppointments();
        setDoctorData(doctor);
        setAppointments(appts);
      } catch (e) {
        setDoctorData(null);
        setAppointments([]);
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, []);

  if (loading || loadingDoctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.grey[600] }}>Cargando usuario...</Text>
      </View>
    );
  }

  const doctorName = user?.nombre || doctorData?.usuario_data?.nombre || '';
  const doctorEmail = user?.correo || doctorData?.usuario_data?.correo || '';
  const doctorRole = user?.rol === 2 || doctorData?.usuario_data?.rol === 2 ? 'Médico' : 'No disponible';
  const doctorSpecialty = doctorData?.especialidad_nombre || 'No disponible';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            ¡Bienvenid@, Dr(a). {doctorName}!
          </Text>
          <Text style={styles.headerSubtitle}>
            Panel del Médico
          </Text>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => setActiveTab('inicio')} style={{ marginHorizontal: 24, borderBottomWidth: activeTab === 'inicio' ? 2 : 0, borderBottomColor: Colors.primary.main }}>
          <Text style={{ fontSize: 18, color: activeTab === 'inicio' ? Colors.primary.main : Colors.grey[500], fontWeight: activeTab === 'inicio' ? 'bold' : 'normal', paddingBottom: 4 }}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('perfil')} style={{ marginHorizontal: 24, borderBottomWidth: activeTab === 'perfil' ? 2 : 0, borderBottomColor: Colors.primary.main }}>
          <Text style={{ fontSize: 18, color: activeTab === 'perfil' ? Colors.primary.main : Colors.grey[500], fontWeight: activeTab === 'perfil' ? 'bold' : 'normal', paddingBottom: 4 }}>Perfil</Text>
        </TouchableOpacity>
      </View>
      {/* Contenido de tabs */}
      {activeTab === 'inicio' ? (
        <View style={styles.sections}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => router.push('/(tabs)/doctor/appointments')}
          >
            <MaterialIcons name="event-available" size={48} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Ver Citas Asignadas</Text>
            <Text style={styles.sectionDesc}>Consulta y gestiona tus citas programadas</Text>
          </TouchableOpacity>
          
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="schedule" size={24} color={Colors.primary.main} />
              <Text style={styles.sectionTitle2}>Próximas Citas</Text>
            </View>
            <View style={styles.dashboardCard}>
              {appointments
                .filter(appt => appt.estado !== 'cancelada')
                .slice(0, 3)
                .map((appt, idx) => (
                <View key={idx} style={[
                  styles.appointmentRow,
                  idx === Math.min(2, appointments.filter(a => a.estado !== 'cancelada').length - 1) && styles.lastAppointmentRow
                ]}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>{appt.hora_inicio}</Text>
                  </View>
                  <View style={styles.patientColumn}>
                    <Text style={styles.patientName}>{appt.paciente_data?.nombre} {appt.paciente_data?.apellido}</Text>
                    <Text style={styles.dateText}>{appt.fecha_cita}</Text>
                  </View>
                </View>
              ))}
              {appointments.filter(appt => appt.estado !== 'cancelada').length === 0 && (
                <View style={styles.emptyAppointments}>
                  <MaterialIcons name="event-busy" size={32} color={Colors.grey[400]} />
                  <Text style={styles.emptyText}>No tienes citas programadas</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <MaterialIcons name="person-outline" size={48} color={Colors.grey[400]} style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 22, color: Colors.grey[600], fontWeight: 'bold', marginBottom: 16 }}>Perfil</Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 4 }}>
            Nombre: {doctorName || 'No disponible'}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 4 }}>
            Correo: {doctorEmail || 'No disponible'}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 4 }}>
            Especialidad: {doctorSpecialty}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 16 }}>
            Rol: {doctorRole}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: Colors.error.main, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 8 }}
            onPress={() => {
              logout();
              router.replace('/auth/login');
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    margin: 0,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    marginLeft: 16,
    fontFamily: 'serif',
  },
  sections: {
    flexDirection: 'column',
    gap: 32,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginTop: 12,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.grey[600],
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.grey[800],
  },
  upcomingSection: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
    justifyContent: 'space-between',
  },
  timeColumn: {
    width: 90,
    alignItems: 'center',
    backgroundColor: Colors.primary.main + '10',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  patientColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    marginLeft: 16,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.grey[800],
  },
  dateText: {
    fontSize: 14,
    color: Colors.grey[600],
  },
  emptyAppointments: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.grey[400],
    textAlign: 'center',
  },
  lastAppointmentRow: {
    borderBottomWidth: 0,
  },
}); 