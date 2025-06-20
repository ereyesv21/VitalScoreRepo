import React, { useState } from 'react';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada al endpoint de recuperación de contraseña
      // await api.post('/forgot-password', { correo: email });
      
      // Simulación de envío exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        'Correo enviado',
        'Se ha enviado un enlace de recuperación a tu correo electrónico.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar el correo de recuperación'
      );
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.subtitle}>Recupera tu contraseña</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>¿Olvidaste tu contraseña?</Text>
            
            <Text style={styles.description}>
              No te preocupes, ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

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
                editable={!emailSent}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendResetEmail}
              disabled={loading || emailSent}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary.contrast} />
              ) : (
                <Text style={styles.sendButtonText}>
                  {emailSent ? 'Correo enviado' : 'Enviar correo de recuperación'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backButtonText}>
                ← Volver al inicio de sesión
              </Text>
            </TouchableOpacity>

            {/* Additional Help */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
              <Text style={styles.helpText}>
                Si tienes problemas para acceder a tu cuenta, contacta con nuestro equipo de soporte.
              </Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contactar soporte</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.grey[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
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
  sendButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.grey[400],
  },
  sendButtonText: {
    color: Colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButtonText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '500',
  },
  helpContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.grey[200],
    paddingTop: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: Colors.grey[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: Colors.grey[100],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: Colors.grey[700],
    fontSize: 14,
    fontWeight: '500',
  },
}); 