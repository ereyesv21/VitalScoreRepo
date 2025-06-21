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

interface EPS {
  id_eps: number;
  nombre: string;
}

export default function RegisterScreen() {
  // Estados para campos básicos
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [genero, setGenero] = useState('');
  const [rol, setRol] = useState<'paciente' | 'medico' | ''>('');

  // Estados para campos específicos
  const [especialidad, setEspecialidad] = useState('');
  const [epsId, setEpsId] = useState<number | null>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [epsList, setEpsList] = useState<EPS[]>([]);
  const [loadingEps, setLoadingEps] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cargar lista de EPS al montar el componente
  useEffect(() => {
    loadEPS();
  }, []);

  const loadEPS = async () => {
    setLoadingEps(true);
    try {
      const response = await api.get('/public/eps');
      if (Array.isArray(response)) {
        setEpsList(response);
      } else {
        console.error('La respuesta de EPS no es un array:', response);
        setEpsList([]); // Fallback a un array vacío
      }
    } catch (error) {
      console.error('Error cargando EPS:', error);
      // Si no se pueden cargar las EPS, crear una lista por defecto
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

  const validateForm = () => {
    console.log('🔍 Validando formulario...');
    console.log('📝 Datos del formulario:', { nombre, apellido, email, password, confirmPassword, genero, rol, especialidad, epsId });

    if (!nombre || !apellido || !email || !password || !confirmPassword || !genero || !rol) {
      console.log('❌ Campos obligatorios faltantes');
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (password !== confirmPassword) {
      console.log('❌ Contraseñas no coinciden');
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (password.length < 6) {
      console.log('❌ Contraseña muy corta');
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (rol === 'medico' && !especialidad) {
      console.log('❌ Especialidad faltante para médico');
      Alert.alert('Error', 'Por favor ingresa tu especialidad');
      return false;
    }

    if (!epsId) {
      console.log('❌ EPS no seleccionada');
      Alert.alert('Error', 'Por favor selecciona tu EPS');
      return false;
    }

    console.log('✅ Validación exitosa');
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mapear rol de string a número
      const rolId = rol === 'paciente' ? 1 : 2;
      
      const userData = {
        nombre,
        apellido,
        correo: email,
        contraseña: password,
        genero,
        rol: rolId, // Enviar número en lugar de string
        ...(rol === 'medico' && { especialidad }),
        id_eps: epsId,
      };

      console.log('🌐 Enviando datos de registro:', userData);

      const response = await api.post('/register', userData);

      console.log('✅ Respuesta del registro:', response);

      // Mostrar modal de éxito
      setShowSuccessModal(true);
      
      // Guardar credenciales temporalmente
      AsyncStorage.setItem('tempEmail', email);
      AsyncStorage.setItem('tempPassword', password);
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      Alert.alert(
        'Error en el registro',
        error.message || 'No se pudo completar el registro'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    router.push('/auth/login');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>VitalScore</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad de salud</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Crear Cuenta</Text>

            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de usuario *</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    rol === 'paciente' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRol('paciente')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      rol === 'paciente' && styles.roleButtonTextActive,
                    ]}
                  >
                    Paciente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    rol === 'medico' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRol('medico')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      rol === 'medico' && styles.roleButtonTextActive,
                    ]}
                  >
                    Médico
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Basic Fields */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor={Colors.grey[400]}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu apellido"
                  placeholderTextColor={Colors.grey[400]}
                  value={apellido}
                  onChangeText={setApellido}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={Colors.grey[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.grey[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={Colors.grey[500]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Confirmar contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={Colors.grey[400]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={Colors.grey[500]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Género *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'masculino' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('masculino')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'masculino' && styles.genderButtonTextActive,
                    ]}
                  >
                    Masculino
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'femenino' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('femenino')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'femenino' && styles.genderButtonTextActive,
                    ]}
                  >
                    Femenino
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    genero === 'otro' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGenero('otro')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      genero === 'otro' && styles.genderButtonTextActive,
                    ]}
                  >
                    Otro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Role-specific fields */}
            {rol === 'medico' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Especialidad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ej: Cardiología, Pediatría..."
                  placeholderTextColor={Colors.grey[400]}
                  value={especialidad}
                  onChangeText={setEspecialidad}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* EPS Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EPS *</Text>
              {loadingEps ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary.main} />
                  <Text style={styles.loadingText}>Cargando EPS...</Text>
                </View>
              ) : epsList.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.epsContainer}
                >
                  {epsList.map((eps) => (
                    <TouchableOpacity
                      key={eps.id_eps}
                      style={[
                        styles.epsButton,
                        epsId === eps.id_eps && styles.epsButtonActive,
                      ]}
                      onPress={() => setEpsId(eps.id_eps)}
                    >
                      <Text
                        style={[
                          styles.epsButtonText,
                          epsId === eps.id_eps && styles.epsButtonTextActive,
                        ]}
                      >
                        {eps.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa el nombre de tu EPS"
                  placeholderTextColor={Colors.grey[400]}
                  value={epsId ? epsList.find(eps => eps.id_eps === epsId)?.nombre || '' : ''}
                  onChangeText={(text) => {
                    // Buscar EPS por nombre
                    const foundEps = epsList.find(eps => 
                      eps.nombre.toLowerCase().includes(text.toLowerCase())
                    );
                    setEpsId(foundEps ? foundEps.id_eps : null);
                  }}
                />
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary.contrast} />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>¡Registro exitoso!</Text>
            <Text style={styles.modalMessage}>
              Tu cuenta ha sido creada correctamente como {rol === 'paciente' ? 'paciente' : 'médico'}.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGoToLogin}
            >
              <Text style={styles.modalButtonText}>Ir al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey[600],
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.grey[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.grey[800],
    backgroundColor: Colors.grey[50],
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
  },
  roleButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grey[700],
  },
  roleButtonTextActive: {
    color: Colors.primary.contrast,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
  },
  genderButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey[700],
  },
  genderButtonTextActive: {
    color: Colors.primary.contrast,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.grey[600],
    fontSize: 14,
  },
  epsContainer: {
    flexDirection: 'row',
  },
  epsButton: {
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: Colors.grey[50],
  },
  epsButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
  },
  epsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey[700],
  },
  epsButtonTextActive: {
    color: Colors.primary.contrast,
  },
  registerButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.grey[400],
  },
  registerButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.grey[600],
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  successIcon: {
    backgroundColor: Colors.primary.main,
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grey[800],
    marginBottom: 16,
  },
  modalMessage: {
    color: Colors.grey[700],
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
}); 