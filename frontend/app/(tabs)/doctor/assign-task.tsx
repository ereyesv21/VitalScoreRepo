import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { tareasPacienteService } from '../../../services/tasks';
import { useAuth } from '../../../hooks/useAuth';

export default function AssignTask() {
  const { pacienteId } = useLocalSearchParams();
  const [tarea, setTarea] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!tarea && !diagnostico && !recomendacion) {
      Alert.alert('Error', 'Debes ingresar al menos un campo.');
      return;
    }
    setLoading(true);
    try {
      await tareasPacienteService.asignarTareaAPaciente({
        paciente_id: Number(pacienteId),
        nombre_tarea: tarea,
        descripcion: '',
        diagnostico,
        recomendacion,
        estado: 'pendiente',
      });
      Alert.alert('Éxito', 'Asignación guardada correctamente.');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la asignación.');
    } finally {
      setLoading(false);
    }
  };

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
              Asignar Tarea/Diagnóstico
            </Text>
          </View>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Asignar Tarea / Diagnóstico / Recomendación</Text>
        <TextInput
          style={styles.input}
          placeholder="Tarea"
          value={tarea}
          onChangeText={setTarea}
        />
        <TextInput
          style={styles.input}
          placeholder="Diagnóstico"
          value={diagnostico}
          onChangeText={setDiagnostico}
        />
        <TextInput
          style={styles.input}
          placeholder="Recomendación"
          value={recomendacion}
          onChangeText={setRecomendacion}
        />
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.grey[300] },
  button: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
}); 