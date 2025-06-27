import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { authService } from '../../../services/auth';
import { patientService, PatientWithUser } from '../../../services/patients';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const [patientData, setPatientData] = useState<PatientWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const modalAnimation = useRef(new Animated.Value(0)).current;
  
  // Form data
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generoError, setGeneroError] = useState('');

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      modalAnimation.setValue(0);
    }
  }, [showSuccessModal]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const data = await patientService.getCurrentPatient();
      setPatientData(data);
      
      // Pre-fill form with current data
      if (data?.usuario_data) {
        setNombre(data.usuario_data.nombre || '');
        setApellido(data.usuario_data.apellido || '');
        setEmail(data.usuario_data.correo || '');
        setGenero(data.usuario_data.genero || '');
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del paciente');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    
    // Validate nombre
    if (!nombre.trim()) {
      setNombreError('El nombre es obligatorio');
      valid = false;
    } else if (nombre.trim().length < 3) {
      setNombreError('El nombre debe tener al menos 3 caracteres');
      valid = false;
    } else {
      setNombreError('');
    }

    // Validate apellido
    if (!apellido.trim()) {
      setApellidoError('El apellido es obligatorio');
      valid = false;
    } else if (apellido.trim().length < 3) {
      setApellidoError('El apellido debe tener al menos 3 caracteres');
      valid = false;
    } else {
      setApellidoError('');
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('El correo es obligatorio');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('El correo electrónico no tiene un formato válido');
      valid = false;
    } else {
      setEmailError('');
    }

    // Validate password (only if provided)
    if (password) {
      if (!passwordRegex.test(password)) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número');
        valid = false;
      } else {
        setPasswordError('');
      }

      // Validate confirm password
      if (!confirmPassword) {
        setConfirmPasswordError('Debes confirmar la contraseña');
        valid = false;
      } else if (confirmPassword !== password) {
        setConfirmPasswordError('Las contraseñas no coinciden');
        valid = false;
      } else {
        setConfirmPasswordError('');
      }
    }

    // Validate genero
    if (!genero) {
      setGeneroError('El género es obligatorio');
      valid = false;
    } else {
      setGeneroError('');
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!patientData?.usuario_data?.id_usuario) {
      Alert.alert('Error', 'No se pudo identificar el usuario');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: email.trim(),
        genero: genero,
      };

      // Only include password if it was changed
      if (password) {
        updateData.contraseña = password;
      }

      console.log('🔧 Actualizando perfil:', updateData);
      console.log('🔧 ID del usuario:', patientData.usuario_data.id_usuario);
      
      const response = await authService.updateProfile(patientData.usuario_data.id_usuario, updateData);
      console.log('✅ Respuesta del backend:', response);
      
      console.log('🎉 Perfil actualizado exitosamente');
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);
      
      // Ocultar modal después de 2 segundos y navegar
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace('/(tabs)/patient/profile');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.status);
      
      // Handle specific errors
      if (error.message && error.message.includes('Error en la actualización')) {
        setEmailError('Este correo electrónico ya está registrado');
      } else {
        if (Platform.OS === 'web') {
          window.alert(`Error: ${error.message || 'No se pudo actualizar el perfil'}`);
        } else {
          Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('🚫 Cancelando edición, navegando a perfil...');
    router.replace('/(tabs)/patient/profile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
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
            {nombreError ? (
              <Text style={styles.errorText}>{nombreError}</Text>
            ) : null}
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
            {apellidoError ? (
              <Text style={styles.errorText}>{apellidoError}</Text>
            ) : null}
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
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Género *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, genero === 'Masculino' && styles.genderButtonActive]}
                onPress={() => setGenero('Masculino')}
              >
                <Text style={[styles.genderButtonText, genero === 'Masculino' && styles.genderButtonTextActive]}>
                  Masculino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, genero === 'Femenino' && styles.genderButtonActive]}
                onPress={() => setGenero('Femenino')}
              >
                <Text style={[styles.genderButtonText, genero === 'Femenino' && styles.genderButtonTextActive]}>
                  Femenino
                </Text>
              </TouchableOpacity>
            </View>
            {generoError ? (
              <Text style={styles.errorText}>{generoError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva contraseña (opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.grey[400]} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Deja vacío para mantener la actual"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.grey[400]} />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {password ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar nueva contraseña *</Text>
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
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.primary.contrast} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Modal de éxito */}
      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.successModal,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color={Colors.success.main} />
            </View>
            <Text style={styles.successTitle}>¡Perfil Actualizado!</Text>
            <Text style={styles.successMessage}>Los cambios se han guardado correctamente</Text>
            <View style={styles.successProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>
            <Text style={styles.successSubtext}>Redirigiendo en 2 segundos...</Text>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[700],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.grey[800],
    paddingVertical: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  genderButtonText: {
    fontSize: 16,
    color: Colors.grey[700],
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: Colors.primary.contrast,
  },
  errorText: {
    color: Colors.error.main,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.grey[200],
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.grey[700],
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey[50],
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey[600],
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: Colors.light.background,
    padding: 32,
    borderRadius: 16,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grey[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    color: Colors.grey[600],
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  successProgress: {
    height: 6,
    backgroundColor: Colors.grey[200],
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success.main,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success.main,
    borderRadius: 3,
  },
  successSubtext: {
    color: Colors.grey[500],
    fontSize: 14,
    textAlign: 'center',
  },
});

export const options = {
  headerShown: false,
};
