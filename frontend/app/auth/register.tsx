import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Aquí irá la lógica de registro cuando tengamos el backend
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
        <ThemedText style={styles.subtitle}>Completa tus datos para registrarte</ThemedText>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account" size={24} color={Colors.primary.dark} />
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

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

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-check" size={24} color={Colors.primary.dark} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: Colors.primary.dark }]}
          onPress={handleRegister}
        >
          <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
        </Pressable>

        <View style={styles.loginContainer}>
          <ThemedText style={styles.loginText}>¿Ya tienes una cuenta? </ThemedText>
          <Pressable onPress={() => router.push('/auth/login')}>
            <ThemedText style={[styles.loginText, { color: Colors.primary.dark }]}>
              Inicia Sesión
            </ThemedText>
          </Pressable>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
}); 