import { View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/auth';
import { router } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!correo || !contraseña) {
            Alert.alert('Error', 'Por favor ingresa correo y contraseña');
            return;
        }

        try {
            setLoading(true);
            console.log('🔄 Attempting login with:', { correo, contraseña });
            
            const response = await authService.login({ correo, contraseña });
            console.log('✅ Login successful:', response);
            
            // Navigate based on user role
            if (response.rol === 'medico') {
                console.log('👨‍⚕️ Navigating to doctor dashboard');
                router.replace('/(tabs)/doctor');
            } else if (response.rol === 'paciente') {
                console.log('👤 Navigating to patient dashboard');
                router.replace('/(tabs)/patient');
            } else {
                console.log('❌ Invalid role:', response.rol);
                Alert.alert('Error', 'Rol de usuario no válido');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            Alert.alert(
                'Error de inicio de sesión',
                error instanceof Error ? error.message : 'Error al iniciar sesión'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>VitalScore</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Inicia sesión para continuar
                </ThemedText>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={correo}
                        onChangeText={setCorreo}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        secureTextEntry
                        value={contraseña}
                        onChangeText={setContraseña}
                    />
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                    <ThemedText style={styles.forgotPasswordText}>
                        ¿Olvidaste tu contraseña?
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[Colors.primary.dark, Colors.primary.medium]}
                        style={styles.button}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </ThemedText>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                    <ThemedText style={styles.registerText}>¿No tienes una cuenta? </ThemedText>
                    <TouchableOpacity onPress={() => router.push('/auth/register')}>
                        <ThemedText style={[styles.registerText, { color: Colors.primary.dark }]}>
                            Regístrate
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.testCredentials}>
                <ThemedText style={styles.testCredentialsTitle}>
                    Credenciales de prueba
                </ThemedText>
                <ThemedText style={styles.testCredentialsText}>
                    Doctor: medico@test.com / password
                </ThemedText>
                <ThemedText style={styles.testCredentialsText}>
                    Paciente: paciente@test.com / password
                </ThemedText>
            </View>
        </View>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: Colors.neutral.dark,
  },
}); 