import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/admin';
import { registrationService } from '../../services/registration';

interface EPS {
  id_eps: number;
  nombre: string;
}

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [genero, setGenero] = useState('');
  const [rol, setRol] = useState<'paciente' | 'medico' | 'administrador' | ''>('');
  const [especialidad, setEspecialidad] = useState('');
  const [epsId, setEpsId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [loadingEps, setLoadingEps] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [especialidadId, setEspecialidadId] = useState<number | null>(null);
  const [especialidadesError, setEspecialidadesError] = useState(false);

  useEffect(() => {
    loadEPS();
    loadEspecialidades();
  }, []);

  const loadEPS = async () => {
    setLoadingEps(true);
    try {
      const response = await api.get('/public/eps');
      if (Array.isArray(response)) {
        setEpsList(response);
      } else {
        setEpsList([]);
      }
    } catch (error) {
      console.error('Error cargando EPS:', error);
      setEpsList([
        { id_eps: 1, nombre: 'Sura' },
        { id_eps: 2, nombre: 'Colsanitas' },
        { id_eps: 3, nombre: 'Famisanar' },
        { id_eps: 4, nombre: 'Compensar' },
        { id_eps: 5, nombre: 'Nueva EPS' },
        { id_eps: 6, nombre: 'Salud Total' },
      ]);
    } finally {
      setLoadingEps(false);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const response = await adminService.getAllSpecialties();
      console.log('Especialidades:', response);
      if (response && Array.isArray(response.data)) {
        setEspecialidades(response.data);
        setEspecialidadesError(false);
      } else {
        setEspecialidades([]);
        setEspecialidadesError(true);
      }
    } catch (error) {
      setEspecialidades([]);
      setEspecialidadesError(true);
    }
  };

  const validateForm = () => {
    if (!nombre || !apellido || !email || !password || !confirmPassword || !genero || !rol || !epsId) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (rol === 'medico' && !especialidadId) {
      Alert.alert('Error', 'Por favor selecciona tu especialidad');
      return false;
    }
    if (rol === 'administrador' && !adminKey) {
      Alert.alert('Error', 'Por favor ingresa la clave de administrador');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      let rolId = 1;
      if (rol === 'medico') rolId = 2;
      if (rol === 'administrador') rolId = 3;
      
      const userData = {
        nombre,
        apellido,
        correo: email,
        contraseña: password,
        genero,
        rol: rolId,
      };

      let additionalData = {};
      if (rol === 'medico') {
        additionalData = { especialidad: especialidadId };
      } else if (rol === 'paciente') {
        additionalData = { id_eps: epsId };
      } else if (rol === 'administrador') {
        additionalData = { adminKey };
      }

      console.log('🔐 Enviando datos de registro:', { userData, additionalData });

      // Usar el servicio de registro completo que maneja la creación del perfil
      const result = await registrationService.completeRegistration(userData, additionalData);
      
      console.log('✅ Resultado del registro:', result);
      
      if (result.success) {
        console.log('🎉 Registro exitoso, mostrando modal');
        setShowSuccessModal(true);
      } else {
        console.log('❌ Registro falló');
        Alert.alert('Error en el registro', 'No se pudo completar el registro');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      Alert.alert('Error en el registro', error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>VitalScore</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad de salud</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Crear Cuenta</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de usuario *</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, rol === 'paciente' && styles.roleButtonActive]}
                  onPress={() => setRol('paciente')}
                >
                  <Text style={[styles.roleButtonText, rol === 'paciente' && styles.roleButtonTextActive]}>Paciente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, rol === 'medico' && styles.roleButtonActive]}
                  onPress={() => setRol('medico')}
                >
                  <Text style={[styles.roleButtonText, rol === 'medico' && styles.roleButtonTextActive]}>Médico</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, rol === 'administrador' && styles.roleButtonActive]}
                  onPress={() => setRol('administrador')}
                >
                  <Text style={[styles.roleButtonText, rol === 'administrador' && styles.roleButtonTextActive]}>Administrador</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu nombre"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu apellido"
                  value={apellido}
                  onChangeText={setApellido}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.grey[400]} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Vuelve a escribir la contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.grey[400]} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Género *</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, genero === 'Masculino' && styles.roleButtonActive]}
                  onPress={() => setGenero('Masculino')}
                >
                  <Text style={[styles.roleButtonText, genero === 'Masculino' && styles.roleButtonTextActive]}>Masculino</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, genero === 'Femenino' && styles.roleButtonActive]}
                  onPress={() => setGenero('Femenino')}
                >
                  <Text style={[styles.roleButtonText, genero === 'Femenino' && styles.roleButtonTextActive]}>Femenino</Text>
                </TouchableOpacity>
              </View>
            </View>
            {rol === 'medico' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Especialidad *</Text>
                {especialidadesError ? (
                  <Text style={{ color: Colors.error.main, marginBottom: 8 }}>
                    Error cargando especialidades. Intenta más tarde.
                  </Text>
                ) : especialidades.length === 0 ? (
                  <ActivityIndicator color={Colors.primary.main} style={{ alignSelf: 'flex-start' }} />
                ) : (
                  <View style={styles.pickerContainer}>
                    {especialidades.map((esp) => (
                      <TouchableOpacity
                        key={esp.id_especialidad}
                        style={[styles.pickerButton, especialidadId === esp.id_especialidad && styles.pickerButtonActive]}
                        onPress={() => setEspecialidadId(esp.id_especialidad)}
                      >
                        <Text style={[styles.pickerButtonText, especialidadId === esp.id_especialidad && styles.pickerButtonTextActive]}>
                          {esp.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            {rol === 'administrador' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Clave de administrador *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa la clave de administrador"
                    value={adminKey}
                    onChangeText={setAdminKey}
                    secureTextEntry
                  />
                </View>
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EPS *</Text>
              {loadingEps ? (
                <ActivityIndicator color={Colors.primary.main} style={{ alignSelf: 'flex-start' }} />
              ) : (
                <View style={styles.pickerContainer}>
                  {epsList.map((eps) => (
                    <TouchableOpacity
                      key={eps.id_eps}
                      style={[styles.pickerButton, epsId === eps.id_eps && styles.pickerButtonActive]}
                      onPress={() => setEpsId(eps.id_eps)}
                    >
                      <Text style={[styles.pickerButtonText, epsId === eps.id_eps && styles.pickerButtonTextActive]}>
                        {eps.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.link}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={handleGoToLogin}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle-outline" size={80} color={Colors.success.main} />
            <Text style={styles.modalTitle}>¡Registro Exitoso!</Text>
            <Text style={styles.modalMessage}>Tu cuenta ha sido creada. Ahora puedes iniciar sesión.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleGoToLogin}>
              <Text style={styles.modalButtonText}>Ir a Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 50 },
  title: { fontSize: 40, fontWeight: 'bold', color: Colors.primary.main, fontFamily: 'SpaceMono' },
  subtitle: { fontSize: 16, color: Colors.grey[600], marginTop: 8, fontFamily: 'SpaceMono' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.grey[800], textAlign: 'center', marginBottom: 24, fontFamily: 'SpaceMono' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: Colors.grey[700], marginBottom: 8, fontWeight: '600', fontFamily: 'SpaceMono' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.grey[100], borderRadius: 8, paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 16, color: Colors.grey[800], fontFamily: 'SpaceMono' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  roleButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.grey[300], alignItems: 'center', marginHorizontal: 4 },
  roleButtonActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  roleButtonText: { color: Colors.grey[700], fontWeight: '600', fontFamily: 'SpaceMono' },
  roleButtonTextActive: { color: '#fff' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  pickerButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: Colors.grey[300], marginRight: 10, marginBottom: 10 },
  pickerButtonActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  pickerButtonText: { color: Colors.grey[700], fontWeight: '500' },
  pickerButtonTextActive: { color: '#fff' },
  button: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { backgroundColor: Colors.grey[400] },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'SpaceMono' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: Colors.grey[600], fontFamily: 'SpaceMono' },
  link: { fontSize: 14, color: Colors.primary.main, fontWeight: 'bold', marginLeft: 4, fontFamily: 'SpaceMono' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.grey[800], marginTop: 16, marginBottom: 8, fontFamily: 'SpaceMono' },
  modalMessage: { fontSize: 16, color: Colors.grey[600], textAlign: 'center', marginBottom: 24, lineHeight: 24, fontFamily: 'SpaceMono' },
  modalButton: { backgroundColor: Colors.primary.main, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'SpaceMono' },
});