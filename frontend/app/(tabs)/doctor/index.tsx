import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { doctorService } from '../../../services/doctors';

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const doctor = await doctorService.getCurrentDoctor();
      const appts = await doctorService.getDoctorAppointments();
      setDoctorData(doctor);
      setAppointments(appts);
    } catch (e) {
      // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginTop: 32 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¡Bienvenido, Dr(a). {doctorData?.usuario_data?.nombre || ''}!</Text>
      <Text style={styles.subtitle}>Panel del Médico</Text>
      <View style={styles.quickAccess}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/doctor/appointments')}>
          <Text style={styles.buttonText}>Ver Citas Asignadas</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Próximas Citas</Text>
      {appointments.slice(0, 3).map((appt, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.cardText}>Paciente: {appt.paciente_data?.nombre} {appt.paciente_data?.apellido}</Text>
          <Text style={styles.cardText}>Fecha: {appt.fecha_cita} - {appt.hora_inicio}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: Colors.light.background },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginBottom: 24,
    marginTop: 4,
    opacity: 0.9,
  },
  quickAccess: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  button: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardText: { fontSize: 15, color: Colors.grey[800] },
  link: { color: Colors.primary.main, marginTop: 8, fontWeight: 'bold' },
}); 