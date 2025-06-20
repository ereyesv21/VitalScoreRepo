import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function PatientProfile() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>Juan Pérez</Text>
          <Text style={styles.email}>juan.perez@email.com</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Información Personal</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>Juan Carlos</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Apellido:</Text>
            <Text style={styles.infoValue}>Pérez García</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>Masculino</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EPS:</Text>
            <Text style={styles.infoValue}>Sura</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Estadísticas VitalScore</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Puntos actuales:</Text>
            <Text style={styles.statsValue}>1,250</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Tareas completadas:</Text>
            <Text style={styles.statsValue}>45</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Días consecutivos:</Text>
            <Text style={styles.statsValue}>12</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grey[800],
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.grey[600],
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.grey[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.grey[800],
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
  editButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
}); 