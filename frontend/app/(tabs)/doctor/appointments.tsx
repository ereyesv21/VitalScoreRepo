import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function DoctorAppointments() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📅 Citas Médicas</Text>
        <Text style={styles.subtitle}>Gestiona las citas de tus pacientes</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Citas de Hoy</Text>
          
          <View style={styles.appointmentItem}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.patientName}>María González</Text>
              <Text style={styles.appointmentTime}>10:00 AM</Text>
              <Text style={styles.appointmentType}>Control cardiológico</Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentItem}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.patientName}>Carlos Rodríguez</Text>
              <Text style={styles.appointmentTime}>11:30 AM</Text>
              <Text style={styles.appointmentType}>Consulta general</Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentItem}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.patientName}>Ana López</Text>
              <Text style={styles.appointmentTime}>2:00 PM</Text>
              <Text style={styles.appointmentType}>Seguimiento tratamiento</Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Iniciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximas Citas</Text>
          <Text style={styles.futureAppointment}>Mañana - 9:00 AM - Juan Pérez</Text>
          <Text style={styles.futureAppointment}>Miércoles - 3:00 PM - Laura Martínez</Text>
        </View>

        <TouchableOpacity style={styles.scheduleButton}>
          <Text style={styles.scheduleButtonText}>Programar Nueva Cita</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.grey[600],
  },
  startButton: {
    backgroundColor: Colors.success.main,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '600',
  },
  futureAppointment: {
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 8,
  },
  scheduleButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
}); 