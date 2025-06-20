import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function PatientAppointments() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📅 Mis Citas</Text>
        <Text style={styles.subtitle}>Aquí verás todas tus citas médicas</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próxima Cita</Text>
          <Text style={styles.appointmentText}>Dr. García - Cardiología</Text>
          <Text style={styles.appointmentDate}>15 de junio, 10:00 AM</Text>
          <Text style={styles.appointmentLocation}>Clínica Central</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Citas Anteriores</Text>
          <Text style={styles.appointmentText}>Dr. López - Nutrición</Text>
          <Text style={styles.appointmentDate}>1 de junio, 2:00 PM</Text>
          <Text style={styles.appointmentStatus}>✅ Completada</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.grey[800],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey[600],
    marginBottom: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 12,
  },
  appointmentText: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.grey[600],
    marginBottom: 4,
  },
  appointmentLocation: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  appointmentStatus: {
    fontSize: 14,
    color: Colors.success.main,
    fontWeight: '500',
  },
}); 