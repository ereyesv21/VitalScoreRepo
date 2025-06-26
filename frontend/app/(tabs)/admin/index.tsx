import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'inicio' | 'perfil'>('inicio');

  // Mostrar loader mientras se carga el usuario
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.grey[600] }}>Cargando usuario...</Text>
      </View>
    );
  }

  console.log('USER EN ADMIN DASHBOARD:', user);
  const userName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : '';
  const userEmail = user?.correo || 'No disponible';
  const userRole = user ? (user.rol === 3 ? 'Administrador' : user.rol === 2 ? 'Médico' : user.rol === 1 ? 'Paciente' : 'No disponible') : 'No disponible';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.headerTitle}>¡Bienvenid@, {userName || 'Administrador'}!</Text>
          <Text style={styles.headerSubtitle}>Cuida tu salud y gana puntos</Text>
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
            onPress={() => router.push('/(tabs)/admin/doctors')}
          >
            <MaterialIcons name="medical-services" size={48} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Gestión de Médicos</Text>
            <Text style={styles.sectionDesc}>Administra los médicos registrados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => router.push('/(tabs)/admin/schedules')}
          >
            <MaterialIcons name="schedule" size={48} color={Colors.primary.main} />
            <Text style={styles.sectionTitle}>Gestión de Horarios</Text>
            <Text style={styles.sectionDesc}>Administra los horarios de los médicos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <MaterialIcons name="person-outline" size={48} color={Colors.grey[400]} style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 22, color: Colors.grey[600], fontWeight: 'bold', marginBottom: 16 }}>Perfil</Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 4 }}>
            Nombre: {userName || 'No disponible'}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 4 }}>
            Correo: {userEmail || 'No disponible'}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.grey[800], marginBottom: 16 }}>
            Rol: {userRole || 'No disponible'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: Colors.error.main, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 8 }}
            onPress={logout}
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
    backgroundColor: Colors.light.background,
    padding: 0,
    margin: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 24,
    marginBottom: 8,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.grey[600],
    marginTop: 4,
  },
  title: { display: 'none' },
  subtitle: { display: 'none' },
  sections: {
    flexDirection: 'column',
    gap: 32,
    marginTop: 24,
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
  welcomeContainer: {
    flex: 1,
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
}); 