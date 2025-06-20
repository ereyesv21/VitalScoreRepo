import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function DoctorPatients() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👥 Mis Pacientes</Text>
        <Text style={styles.subtitle}>Gestiona la información de tus pacientes</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pacientes Activos</Text>
          
          <View style={styles.patientItem}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>María González</Text>
              <Text style={styles.patientDetails}>Edad: 45 años | EPS: Sura</Text>
              <Text style={styles.vitalScore}>VitalScore: 1,450 puntos</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientItem}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Carlos Rodríguez</Text>
              <Text style={styles.patientDetails}>Edad: 38 años | EPS: Colsanitas</Text>
              <Text style={styles.vitalScore}>VitalScore: 890 puntos</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientItem}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Ana López</Text>
              <Text style={styles.patientDetails}>Edad: 52 años | EPS: Famisanar</Text>
              <Text style={styles.vitalScore}>VitalScore: 2,100 puntos</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientItem}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Juan Pérez</Text>
              <Text style={styles.patientDetails}>Edad: 29 años | EPS: Sura</Text>
              <Text style={styles.vitalScore}>VitalScore: 1,250 puntos</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Estadísticas Generales</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total pacientes:</Text>
            <Text style={styles.statsValue}>24</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Promedio VitalScore:</Text>
            <Text style={styles.statsValue}>1,420</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Tareas completadas:</Text>
            <Text style={styles.statsValue}>156</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Agregar Nuevo Paciente</Text>
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
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: Colors.grey[600],
    marginBottom: 2,
  },
  vitalScore: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: Colors.primary.contrast,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  statsLabel: {
    fontSize: 16,
    color: Colors.grey[600],
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.success.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
}); 