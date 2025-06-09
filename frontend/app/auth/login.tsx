import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Credenciales de prueba
    if (email === 'paciente@paciente.com' && password === 'Paciente1234*') {
      router.push('/(tabs)/patient');
    } else if (email === 'medico@medico.com' && password === 'Medico1234*') {
      router.push('/(tabs)/doctor');
    } else {
      Alert.alert(
        'Error de autenticación',
        'Las credenciales proporcionadas no son válidas. Por favor, intenta de nuevo.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Iniciar Sesión</ThemedText>
        <ThemedText style={styles.subtitle}>Ingresa tus credenciales para continuar</ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email" size={24} color={Colors.primary.dark} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock" size={24} color={Colors.primary.dark} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable 
          style={styles.forgotPassword}
          onPress={() => router.push('/auth/forgot-password')}
        >
          <ThemedText style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.button, { backgroundColor: Colors.primary.dark }]}
          onPress={handleLogin}
        >
          <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
        </Pressable>

        <View style={styles.registerContainer}>
          <ThemedText style={styles.registerText}>¿No tienes una cuenta? </ThemedText>
          <Pressable onPress={() => router.push('/auth/register')}>
            <ThemedText style={[styles.registerText, { color: Colors.primary.dark }]}>
              Regístrate
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.testCredentials}>
          <ThemedText style={styles.testCredentialsTitle}>Credenciales de prueba:</ThemedText>
          <ThemedText style={styles.testCredentialsText}>Paciente: paciente@paciente.com / Paciente1234*</ThemedText>
          <ThemedText style={styles.testCredentialsText}>Médico: medico@medico.com / Medico1234*</ThemedText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.light,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.dark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.primary.dark,
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: Colors.text.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
  testCredentials: {
    marginTop: 40,
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  testCredentialsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.dark,
    marginBottom: 8,
  },
  testCredentialsText: {
    fontSize: 14,
    color: Colors.neutral.dark,
    marginBottom: 4,
  },
}); 