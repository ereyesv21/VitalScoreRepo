import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { doctorService } from '../../../services/doctors';
import { useAuth } from '../../../hooks/useAuth';

export default function DoctorAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  const loadAppointments = async () => {
    setLoading(true);
    try {
      console.log('🔄 Recargando citas del médico...');
      const appts = await doctorService.getDoctorAppointments();
      console.log('✅ Citas cargadas:', appts.length, 'citas');
      setAppointments(appts);
    } catch (e) {
      console.error('❌ Error cargando citas:', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Recargar citas cada vez que la pantalla se enfoca (cuando regresas)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Pantalla de citas enfocada - recargando datos...');
      loadAppointments();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  const doctorName = user?.nombre || '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              Dr(a). {doctorName}
            </Text>
            <Text style={styles.headerSubtitle}>
              Citas Asignadas
            </Text>
          </View>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      
      <View style={styles.content}>
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
                  disabled={!(item.paciente || item.paciente_data?.id_paciente)}
                  onPress={() => {
                    const pacienteId = item.paciente || item.paciente_data?.id_paciente;
                    console.log('Navegando a perfil paciente:', { pacienteId, citaId: item.id_cita });
                    if (pacienteId) {
                      router.push({ pathname: '/(tabs)/doctor/patient-profile', params: { pacienteId, citaId: item.id_cita } });
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey[600],
    textAlign: 'center',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: 16,
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardText: { fontSize: 15, color: Colors.grey[800] },
  link: { color: Colors.primary.main, marginTop: 8, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.grey[500], marginTop: 32 },
  citaItemCancelled: { backgroundColor: '#ffeaea', borderColor: Colors.error.main, borderWidth: 1 },
  cancelledText: { color: Colors.error.main, fontWeight: 'bold' },
  cancelledReason: { color: Colors.error.main, fontStyle: 'italic', marginTop: 4 },
}); 