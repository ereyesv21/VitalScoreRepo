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
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    checkTempCredentials();
  }, []);

  const checkTempCredentials = async () => {
    try {
      const tempEmail = await AsyncStorage.getItem('tempEmail');
      const tempPassword = await AsyncStorage.getItem('tempPassword');
      
      if (tempEmail && tempPassword) {
        setEmail(tempEmail);
        setPassword(tempPassword);
        setShowWelcomeMessage(true);
        
        // Limpiar credenciales temporales
        await AsyncStorage.removeItem('tempEmail');
        await AsyncStorage.removeItem('tempPassword');
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking temp credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      console.log('🌐 Enviando login:', { correo: email, contraseña: password });
      
      const response = await api.post('/login', {
        correo: email,
        contraseña: password,
      });

      console.log('✅ Respuesta del login:', response);

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('userRole', response.rol);
      await AsyncStorage.setItem('userData', JSON.stringify(response.usuario));

      console.log('💾 Datos guardados:', { 
        token: response.token, 
        rol: response.rol, 
        usuario: response.usuario 
      });

      // Redirigir según el rol
      if (response.rol === 'paciente') {
        console.log('🔄 Redirigiendo a paciente...');
        // @ts-ignore
        router.push('/(tabs)/patient/');
      } else if (response.rol === 'medico') {
        console.log('🔄 Redirigiendo a médico...');
        // @ts-ignore
        router.push('/(tabs)/doctor/');
      } else {
        console.log('❌ Rol no reconocido:', response.rol);
        Alert.alert('Error', 'Rol no reconocido');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'Credenciales incorrectas'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleRegister = () => {
    router.push('/auth/register');
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
            <Text style={styles.subtitle}>Tu salud, tu puntuación</Text>
          </View>

          {/* Welcome Message */}
          {showWelcomeMessage && (
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>¡Bienvenido! 🎉</Text>
              <Text style={styles.welcomeText}>
                Tu cuenta ha sido creada exitosamente. Tus credenciales han sido pre-llenadas.
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Ingresa tu contraseña"
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
                  <Text style={styles.eyeText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary.contrast} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  welcomeCard: {
    backgroundColor: Colors.success.main,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.background,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.light.background,
    textAlign: 'center',
    lineHeight: 20,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.grey[400],
  },
  loginButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: Colors.grey[600],
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
}); 