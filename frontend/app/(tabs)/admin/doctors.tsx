import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { adminService, Doctor } from '../../../services/admin';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadDoctors(page);
  }, [page]);

  const loadDoctors = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await adminService.getAllDoctors(pageNum, pageSize);
      setDoctors(data.items);
      setTotal(data.total);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los médicos');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < Math.ceil(total / pageSize)) setPage(page + 1);
  };

  const renderDoctorRow = ({ item }: { item: Doctor }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.usuario_data?.nombre || '-'}</Text>
      <Text style={styles.tableCell}>{item.usuario_data?.apellido || '-'}</Text>
      <Text style={styles.tableCell}>{item.usuario_data?.correo || '-'}</Text>
      <Text style={styles.tableCell}>{item.usuario_data?.genero || '-'}</Text>
      <Text style={styles.tableCell}>{item.eps_nombre || `EPS ${item.eps}` || '-'}</Text>
      <Text style={styles.tableCell}>{item.especialidad_nombre || `Especialidad ${item.especialidad}` || '-'}</Text>
      <Text style={styles.tableCell}>{item.usuario_data?.estado || '-'}</Text>
      <Text style={[styles.tableCell, { color: item.estado === 'activo' ? Colors.success.main : Colors.error.main }]}>{item.estado || '-'}</Text>
      <View style={styles.tableActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Editar', 'Funcionalidad en desarrollo')}>
          <MaterialIcons name="edit" size={20} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Activar/Inactivar', 'Funcionalidad en desarrollo')}>
          <MaterialIcons name={item.estado === 'activo' ? 'block' : 'check-circle'} size={20} color={item.estado === 'activo' ? Colors.error.main : Colors.success.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Eliminar', 'Funcionalidad en desarrollo')}>
          <MaterialIcons name="delete" size={20} color={Colors.error.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Detalles', 'Funcionalidad en desarrollo')}>
          <MaterialIcons name="info" size={20} color={Colors.info.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón de regresar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/admin')}>
        <MaterialIcons name="arrow-back" size={24} color={Colors.primary.main} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Gestión de Médicos</Text>
      {/* Tabla de médicos */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nombre</Text>
        <Text style={styles.tableHeaderCell}>Apellido</Text>
        <Text style={styles.tableHeaderCell}>Correo</Text>
        <Text style={styles.tableHeaderCell}>Género</Text>
        <Text style={styles.tableHeaderCell}>EPS</Text>
        <Text style={styles.tableHeaderCell}>Especialidad</Text>
        <Text style={styles.tableHeaderCell}>Estado Usuario</Text>
        <Text style={styles.tableHeaderCell}>Estado Médico</Text>
        <Text style={styles.tableHeaderCell}>Acciones</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id_medico.toString()}
          renderItem={renderDoctorRow}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay médicos registrados.</Text>}
        />
      )}
      {/* Paginación */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity style={styles.pageButton} onPress={handlePrevPage} disabled={page === 1}>
          <MaterialIcons name="chevron-left" size={28} color={page === 1 ? Colors.grey[400] : Colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</Text>
        <TouchableOpacity style={styles.pageButton} onPress={handleNextPage} disabled={page >= Math.ceil(total / pageSize)}>
          <MaterialIcons name="chevron-right" size={28} color={page >= Math.ceil(total / pageSize) ? Colors.grey[400] : Colors.primary.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary.main,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.grey[200],
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.primary.main,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    paddingVertical: 8,
    elevation: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: Colors.grey[800],
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1.5,
  },
  actionButton: {
    marginHorizontal: 4,
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grey[500],
    marginTop: 32,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  pageButton: {
    padding: 8,
  },
  pageText: {
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
}); 