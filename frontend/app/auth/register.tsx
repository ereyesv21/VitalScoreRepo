import { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { registrationService } from '../../services/registration';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const [genero, setGenero] = useState('');
    const [rol, setRol] = useState<'paciente' | 'medico'>('paciente');
    const [especialidad, setEspecialidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const registrationData = {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                correo: correo.trim(),
                contraseña: contraseña,
                genero: genero.trim(),
                rol: rol === 'paciente' ? 1 : 2,
                ...(rol === 'medico' && { especialidad: especialidad.trim() })
            };

            console.log('📝 Registration data:', registrationData);

            const response = await registrationService.register(registrationData);
            console.log('✅ Registration successful:', response);

            // Store the token
            await AsyncStorage.setItem('token', response.token);
            global.token = response.token;

            // Store user role
            await AsyncStorage.setItem('userRole', response.rol);

            // Navigate to the appropriate dashboard
            if (response.rol === 'paciente') {
                router.replace('/(tabs)/patient');
            } else {
                router.replace('/(tabs)/doctor');
            }

        } catch (error: any) {
            console.error('❌ Registration error:', error);
            setError(error.message || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        // Validations
        if (!nombre || !apellido || !correo || !contraseña || !confirmarContraseña || !genero) {
            setError('Por favor completa todos los campos');
            return false;
        }

        if (rol === 'medico' && !especialidad) {
            setError('Por favor ingresa tu especialidad');
            return false;
        }

        // Name validation (only letters and spaces)
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre.trim())) {
            setError('El nombre solo puede contener letras y espacios');
            return false;
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellido.trim())) {
            setError('El apellido solo puede contener letras y espacios');
            return false;
        }

        // Email validation
        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo.trim())) {
            setError('Por favor ingresa un correo electrónico válido');
            return false;
        }

        // Password validation (at least 6 characters, one letter and one number)
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(contraseña)) {
            setError('La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número');
            return false;
        }

        if (contraseña !== confirmarContraseña) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Crear Cuenta</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Completa tus datos para registrarte
                </ThemedText>
            </View>

            <View style={styles.form}>
                {/* Nombre */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                        autoCapitalize="words"
                    />
                </View>

                {/* Apellido */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Apellido"
                        value={apellido}
                        onChangeText={setApellido}
                        autoCapitalize="words"
                    />
                </View>

                {/* Correo */}
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

                {/* Contraseña */}
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

                {/* Confirmar Contraseña */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-check" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar contraseña"
                        secureTextEntry
                        value={confirmarContraseña}
                        onChangeText={setConfirmarContraseña}
                    />
                </View>

                {/* Género */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="gender-male-female" size={24} color={Colors.primary.dark} />
                    <TextInput
                        style={styles.input}
                        placeholder="Género"
                        value={genero}
                        onChangeText={setGenero}
                        autoCapitalize="words"
                    />
                </View>

                {/* Tipo de Usuario */}
                <View style={styles.roleContainer}>
                    <ThemedText style={styles.roleLabel}>Tipo de usuario:</ThemedText>
                    <View style={styles.roleButtons}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                rol === 'paciente' && styles.roleButtonActive
                            ]}
                            onPress={() => setRol('paciente')}
                        >
                            <MaterialCommunityIcons 
                                name="account-heart" 
                                size={24} 
                                color={rol === 'paciente' ? Colors.text.light : Colors.primary.dark} 
                            />
                            <ThemedText style={[
                                styles.roleButtonText,
                                rol === 'paciente' && styles.roleButtonTextActive
                            ]}>
                                Paciente
                            </ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                rol === 'medico' && styles.roleButtonActive
                            ]}
                            onPress={() => setRol('medico')}
                        >
                            <MaterialCommunityIcons 
                                name="stethoscope" 
                                size={24} 
                                color={rol === 'medico' ? Colors.text.light : Colors.primary.dark} 
                            />
                            <ThemedText style={[
                                styles.roleButtonText,
                                rol === 'medico' && styles.roleButtonTextActive
                            ]}>
                                Médico
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Especialidad (solo para médicos) */}
                {rol === 'medico' && (
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="medical-bag" size={24} color={Colors.primary.dark} />
                        <TextInput
                            style={styles.input}
                            placeholder="Especialidad médica"
                            value={especialidad}
                            onChangeText={setEspecialidad}
                            autoCapitalize="words"
                        />
                    </View>
                )}

                {/* Error Display */}
                {error ? (
                    <View style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                    </View>
                ) : null}

                {/* Register Button */}
                <TouchableOpacity 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[Colors.primary.dark, Colors.primary.medium]}
                        style={styles.button}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </ThemedText>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <ThemedText style={styles.loginText}>¿Ya tienes una cuenta? </ThemedText>
                    <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                        <ThemedText style={[styles.loginText, { color: Colors.primary.dark }]}>
                            Inicia sesión
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.light,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
        alignItems: 'center',
        paddingHorizontal: 20,
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
        padding: 20,
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
    roleContainer: {
        gap: 12,
    },
    roleLabel: {
        fontSize: 16,
        color: Colors.neutral.dark,
        fontWeight: 'bold',
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary.dark,
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    roleButtonActive: {
        backgroundColor: Colors.primary.dark,
    },
    roleButtonText: {
        fontSize: 16,
        color: Colors.primary.dark,
        fontWeight: 'bold',
    },
    roleButtonTextActive: {
        color: Colors.text.light,
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
    errorContainer: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    errorText: {
        color: Colors.error,
        fontSize: 16,
    },
}); 