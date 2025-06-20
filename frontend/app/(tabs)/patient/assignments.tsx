import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function PatientAssignments() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>✅ Mis Tareas</Text>
        <Text style={styles.subtitle}>Completa tareas para ganar puntos VitalScore</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tareas Pendientes</Text>
          
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>💊 Tomar medicamento A</Text>
            <Text style={styles.taskTime}>08:00 AM</Text>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Completar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskItem}>
            <Text style={styles.taskText}>🏃‍♂️ Ejercicio diario</Text>
            <Text style={styles.taskTime}>17:00 PM</Text>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Completar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskItem}>
            <Text style={styles.taskText}>📊 Medir presión arterial</Text>
            <Text style={styles.taskTime}>20:00 PM</Text>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Completar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tareas Completadas Hoy</Text>
          <Text style={styles.completedTask}>✅ Desayuno saludable</Text>
          <Text style={styles.completedTask}>✅ Caminata matutina</Text>
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
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  taskText: {
    fontSize: 16,
    color: Colors.grey[700],
    flex: 1,
  },
  taskTime: {
    fontSize: 14,
    color: Colors.grey[500],
    marginHorizontal: 12,
  },
  completeButton: {
    backgroundColor: Colors.success.main,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeButtonText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '600',
  },
  completedTask: {
    fontSize: 16,
    color: Colors.success.main,
    marginBottom: 8,
  },
}); 