import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { doctorService } from '../../../services/doctors';

export default function DoctorAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const appts = await doctorService.getDoctorAppointments();
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
    <View style={styles.container}>
      <Text style={styles.title}>Citas Asignadas</Text>
      <FlatList
        data={appointments}
        keyExtractor={item => item.id_cita?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          console.log('Item de cita:', item);
          return (
            <View style={[styles.card, item.estado === 'cancelada' && styles.citaItemCancelled]}>
              <Text style={[styles.cardText, item.estado === 'cancelada' && styles.cancelledText]}>
                Paciente: {item.paciente_data?.nombre} {item.paciente_data?.apellido}
              </Text>
              <Text style={[styles.cardText, item.estado === 'cancelada' && styles.cancelledText]}>
                Fecha: {item.fecha_cita} - {item.hora_inicio}
              </Text>
              <Text style={[styles.cardText, item.estado === 'cancelada' && styles.cancelledText]}>
                Estado: {item.estado === 'cancelada' ? 'Cancelado' : item.estado}
              </Text>
              {item.estado === 'cancelada' && (
                <Text style={styles.cancelledReason}>Motivo: {item.motivo_cancelacion}</Text>
              )}
              <TouchableOpacity
                disabled={!item.paciente}
                onPress={() => {
                  console.log('Navegando a perfil paciente:', { pacienteId: item.paciente, citaId: item.id_cita });
                  if (item.paciente) {
                    router.push({ pathname: '/(tabs)/doctor/patient-profile', params: { pacienteId: item.paciente, citaId: item.id_cita } });
                  } else {
                    alert('No se puede mostrar el perfil: paciente no válido.');
                  }
                }}
              >
                <Text style={styles.link}>Ver Perfil del Paciente</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes citas asignadas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.light.background },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardText: { fontSize: 15, color: Colors.grey[800] },
  link: { color: Colors.primary.main, marginTop: 8, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.grey[500], marginTop: 32 },
  citaItemCancelled: { backgroundColor: '#ffeaea', borderColor: Colors.error.main, borderWidth: 1 },
  cancelledText: { color: Colors.error.main, fontWeight: 'bold' },
  cancelledReason: { color: Colors.error.main, fontStyle: 'italic', marginTop: 4 },
}); 