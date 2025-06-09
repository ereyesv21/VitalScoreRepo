import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // Aquí irá la lógica de recuperación de contraseña cuando tengamos el backend
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Recuperar Contraseña</ThemedText>
        <ThemedText style={styles.subtitle}>
          Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña
        </ThemedText>
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

        <Pressable 
          style={[styles.button, { backgroundColor: Colors.primary.dark }]}
          onPress={handleResetPassword}
        >
          <ThemedText style={styles.buttonText}>Enviar Instrucciones</ThemedText>
        </Pressable>

        <View style={styles.backContainer}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={[styles.backText, { color: Colors.primary.dark }]}>
              Volver al inicio de sesión
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
    paddingHorizontal: 20,
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
  backContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backText: {
    fontSize: 16,
  },
}); 