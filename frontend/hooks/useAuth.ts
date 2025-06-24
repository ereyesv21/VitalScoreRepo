import { useState, useEffect } from 'react';
import { authService, User, UserRole } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const [currentUser, currentRole, authenticated] = await Promise.all([
        authService.getCurrentUser(),
        authService.getCurrentRole(),
        authService.isAuthenticated()
      ]);

      setUser(currentUser);
      setRole(currentRole);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setRole(getRoleName(response.user.rol));
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    rol: number;
    genero: string;
    adminKey?: string;
  }) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setRole(getRoleName(response.user.rol));
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const isAdmin = (): boolean => hasRole('administrador');
  const isDoctor = (): boolean => hasRole('medico');
  const isPatient = (): boolean => hasRole('paciente');

  return {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isDoctor,
    isPatient,
    checkAuthStatus
  };
};

// Función auxiliar para convertir ID de rol a nombre
function getRoleName(roleId: number): UserRole {
  switch (roleId) {
    case 1:
      return 'paciente';
    case 2:
      return 'medico';
    case 3:
      return 'administrador';
    default:
      return 'paciente';
  }
} 