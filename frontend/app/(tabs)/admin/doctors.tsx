import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { adminService, Doctor } from '../../../services/admin';
import { api } from '../../../services/api';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const PAGE_SIZE = 8;

export default function DoctorsAdmin() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [showDetails, setShowDetails] = useState<Doctor | null>(null);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [epsList, setEpsList] = useState<any[]>([]);
  const router = useRouter();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    console.log('useEffect ejecutado');
    fetchCatalogs();
    fetchDoctors();
  }, [page]);

  const fetchCatalogs = async () => {
    const especialidadesRes = await adminService.getEspecialidades();
    setEspecialidades(Array.isArray(especialidadesRes?.data) ? especialidadesRes.data : []);
    const epsRes = await adminService.getEps();
    setEpsList(Array.isArray(epsRes) ? epsRes : []);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const medicosRaw = await api.get('/medicos');
      console.log('Respuesta cruda de /api/medicos:', medicosRaw);
      if (Array.isArray(medicosRaw)) {
        medicosRaw.forEach((m, i) => console.log(`Médico[${i}]:`, m));
      }
      const allDoctors = await adminService.getAllDoctors();
      console.log('Médicos mapeados para la tabla:', allDoctors);
      setDoctors(allDoctors);
      setTotal(allDoctors.length);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los médicos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    Alert.alert(
      'Eliminar médico',
      `¿Seguro que deseas eliminar al médico ${doctor.usuario_data?.nombre} ${doctor.usuario_data?.apellido}? Esta acción no se puede deshacer y eliminará también el usuario relacionado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteDoctor(doctor.id_medico, doctor.usuario);
              fetchDoctors();
              Alert.alert('Éxito', 'Médico eliminado correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el médico.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (doctor: Doctor) => {
    try {
      const newEstado = doctor.usuario_data?.estado === 'activo' ? 'inactivo' : 'activo';
      await adminService.setUserStatus(doctor.usuario, newEstado);
      fetchDoctors();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del médico.');
    }
  };

  const renderDoctorRow = ({ item, index }: { item: Doctor, index: number }) => (
    <View
      style={[
        styles.row,
        index % 2 === 1 && styles.rowAlt,
        hoveredRow === index && styles.rowHover,
      ]}
    >
      <Text style={[styles.cell, styles.cellNombre]} numberOfLines={1} ellipsizeMode="tail">{item.usuario_data?.nombre}</Text>
      <Text style={[styles.cell, styles.cellApellido]} numberOfLines={1} ellipsizeMode="tail">{item.usuario_data?.apellido}</Text>
      <Text style={[styles.cell, styles.cellCorreo]} numberOfLines={1} ellipsizeMode="tail">{item.usuario_data?.correo}</Text>
      <Text style={[styles.cell, styles.cellGenero]} numberOfLines={1} ellipsizeMode="tail">{item.usuario_data?.genero || '-'}</Text>
      <Text style={[styles.cell, styles.cellEps]} numberOfLines={1} ellipsizeMode="tail">{item.eps_nombre || '-'}</Text>
      <Text style={[styles.cell, styles.cellEspecialidad]} numberOfLines={1} ellipsizeMode="tail">{item.especialidad_nombre || '-'}</Text>
      <Text style={[styles.cell, styles.cellEstadoUsuario]} numberOfLines={1} ellipsizeMode="tail">{item.usuario_data?.estado}</Text>
      <Text style={[styles.cell, styles.cellEstadoMedico]} numberOfLines={1} ellipsizeMode="tail">{item.estado || ''}</Text>
      <View style={[styles.actionsCell, styles.cellAcciones]}>
        <TouchableOpacity onPress={() => setShowDetails(item)} style={{ padding: 4 }}>
          <MaterialIcons name="info" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setEditDoctor(item); setShowForm(true); }} style={{ padding: 4 }}>
          <MaterialIcons name="edit" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4 }}>
          <MaterialIcons name="delete" size={24} color={Colors.error.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleToggleActive(item)} style={{ padding: 4 }}>
          <MaterialIcons name={item.usuario_data?.estado === 'activo' ? 'toggle-on' : 'toggle-off'} size={28} color={item.usuario_data?.estado === 'activo' ? Colors.success.main : Colors.grey[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginatedDoctors = doctors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Log para depuración final
  useEffect(() => {
    console.log('Array doctors para renderizar:', doctors);
  }, [doctors]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/admin')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Médicos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setEditDoctor(null); setShowForm(true); }}>
          <MaterialIcons name="person-add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Nuevo Médico</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Nombre</Text>
        <Text style={styles.headerCell}>Apellido</Text>
        <Text style={styles.headerCell}>Correo</Text>
        <Text style={styles.headerCell}>Género</Text>
        <Text style={styles.headerCell}>EPS</Text>
        <Text style={styles.headerCell}>Especialidad</Text>
        <Text style={styles.headerCell}>Estado Usuario</Text>
        <Text style={styles.headerCell}>Estado Médico</Text>
        <Text style={styles.headerCell}>Acciones</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={paginatedDoctors}
          renderItem={renderDoctorRow}
          keyExtractor={item => item.id_medico.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay médicos registrados.</Text>}
        />
      )}

      {/* Paginación */}
      <View style={styles.pagination}>
        <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
          <MaterialIcons name="chevron-left" size={32} color={page === 1 ? Colors.grey[300] : Colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.pageText}>{page} / {totalPages || 1}</Text>
        <TouchableOpacity disabled={page === totalPages || totalPages === 0} onPress={() => setPage(page + 1)}>
          <MaterialIcons name="chevron-right" size={32} color={page === totalPages || totalPages === 0 ? Colors.grey[300] : Colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Modales para formulario y detalles */}
      <DoctorForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDoctors}
        editDoctor={editDoctor}
        especialidades={especialidades}
        epsList={epsList}
      />
      <Modal visible={!!showDetails} animationType="fade" transparent onRequestClose={() => setShowDetails(null)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: '#fff', padding: 32, borderRadius: 16, minWidth: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: Colors.primary.main }}>Detalles del Médico</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Nombre:</Text> {showDetails?.usuario_data?.nombre}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Apellido:</Text> {showDetails?.usuario_data?.apellido}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Correo:</Text> {showDetails?.usuario_data?.correo}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Género:</Text> {showDetails?.usuario_data?.genero}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>EPS:</Text> {showDetails?.eps_nombre}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Especialidad:</Text> {showDetails?.especialidad_nombre}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Estado usuario:</Text> {showDetails?.usuario_data?.estado}</Text>
            <Text style={{ marginBottom: 4 }}><Text style={{ fontWeight: 'bold' }}>Estado médico:</Text> {showDetails?.estado}</Text>
            <Pressable onPress={() => setShowDetails(null)} style={{ marginTop: 24, alignSelf: 'center' }}>
              <Text style={{ color: Colors.primary.main, fontWeight: 'bold' }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.grey[100],
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary.main,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eaf1fb',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 14,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.primary.main,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.2,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    backgroundColor: '#fff',
    minHeight: 48,
    borderBottomWidth: 0,
    marginBottom: 2,
    borderRadius: 12,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rowAlt: {
    backgroundColor: '#f4f8fb',
  },
  rowHover: {
    backgroundColor: '#e3eefd',
  },
  cell: {
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    // Anchos fijos por columna
  },
  cellNombre: { minWidth: 120, maxWidth: 140 },
  cellApellido: { minWidth: 120, maxWidth: 140 },
  cellCorreo: { minWidth: 180, maxWidth: 220 },
  cellGenero: { minWidth: 100, maxWidth: 110 },
  cellEps: { minWidth: 130, maxWidth: 150 },
  cellEspecialidad: { minWidth: 150, maxWidth: 170 },
  cellEstadoUsuario: { minWidth: 110, maxWidth: 120 },
  cellEstadoMedico: { minWidth: 110, maxWidth: 120 },
  cellAcciones: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexGrow: 0,
    alignSelf: 'flex-end',
    minWidth: 120,
  },
  actionsCell: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexGrow: 0,
    alignSelf: 'flex-end',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grey[500],
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  pageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
});

// Formulario de crear/editar médico adaptado
function DoctorForm({
  visible,
  onClose,
  onSuccess,
  editDoctor,
  especialidades,
  epsList
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDoctor: Doctor | null;
  especialidades: any[];
  epsList: any[];
}) {
  const isEdit = !!editDoctor;
  const [nombre, setNombre] = useState(editDoctor?.usuario_data?.nombre || '');
  const [apellido, setApellido] = useState(editDoctor?.usuario_data?.apellido || '');
  const [correo, setCorreo] = useState(editDoctor?.usuario_data?.correo || '');
  const [contraseña, setContraseña] = useState('');
  const [genero, setGenero] = useState(editDoctor?.usuario_data?.genero || '');
  const [especialidad, setEspecialidad] = useState(editDoctor?.especialidad || '');
  const [eps, setEps] = useState(editDoctor?.eps || '');
  const [estadoUsuario, setEstadoUsuario] = useState(editDoctor?.usuario_data?.estado || 'activo');
  const [estadoMedico, setEstadoMedico] = useState(editDoctor?.estado || 'activo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      setNombre(editDoctor?.usuario_data?.nombre || '');
      setApellido(editDoctor?.usuario_data?.apellido || '');
      setCorreo(editDoctor?.usuario_data?.correo || '');
      setGenero(editDoctor?.usuario_data?.genero || '');
      setEspecialidad(editDoctor?.especialidad || '');
      setEps(editDoctor?.eps || '');
      setEstadoUsuario(editDoctor?.usuario_data?.estado || 'activo');
      setEstadoMedico(editDoctor?.estado || 'activo');
    } else {
      setNombre('');
      setApellido('');
      setCorreo('');
      setContraseña('');
      setGenero('');
      setEspecialidad('');
      setEps('');
      setEstadoUsuario('activo');
      setEstadoMedico('activo');
    }
    setError('');
    setSuccess('');
  }, [visible, editDoctor]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!nombre || !apellido || !correo || (!isEdit && !contraseña) || !genero || !especialidad || !eps) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && editDoctor) {
        await adminService.updateDoctor(
          editDoctor.usuario,
          editDoctor.id_medico,
          {
            nombre,
            apellido,
            correo,
            genero,
            estado: estadoUsuario,
            especialidad: Number(especialidad),
            id_eps: Number(eps),
          }
        );
        setSuccess('Médico actualizado correctamente.');
      } else {
        await adminService.createDoctor({
          nombre,
          apellido,
          correo,
          contraseña,
          genero,
          especialidad: Number(especialidad),
          id_eps: Number(eps),
        });
        setSuccess('Médico creado correctamente.');
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (e) {
      setError('Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={formStyles.container}>
        <Text style={formStyles.title}>{isEdit ? 'Editar Médico' : 'Nuevo Médico'}</Text>
        <TextInput
          style={formStyles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Apellido"
          value={apellido}
          onChangeText={setApellido}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!isEdit && (
          <TextInput
            style={formStyles.input}
            placeholder="Contraseña"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
          />
        )}
        {/* Select de género */}
        <View style={formStyles.selectContainer}>
          <Text style={formStyles.selectLabel}>Género</Text>
          <Picker
            selectedValue={genero}
            onValueChange={setGenero}
            style={formStyles.picker}
          >
            <Picker.Item label="Selecciona un género" value="" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="Masculino" value="Masculino" />
          </Picker>
        </View>
        {/* Select de especialidad */}
        <View style={formStyles.selectContainer}>
          <Text style={formStyles.selectLabel}>Especialidad</Text>
          <Picker
            selectedValue={especialidad}
            onValueChange={setEspecialidad}
            style={formStyles.picker}
          >
            <Picker.Item label="Selecciona una especialidad" value="" />
            {(Array.isArray(especialidades) ? especialidades : []).map((esp) => (
              <Picker.Item key={esp.id_especialidad} label={esp.nombre} value={esp.id_especialidad} />
            ))}
          </Picker>
        </View>
        {/* Select de EPS */}
        <View style={formStyles.selectContainer}>
          <Text style={formStyles.selectLabel}>EPS</Text>
          <Picker
            selectedValue={eps}
            onValueChange={setEps}
            style={formStyles.picker}
          >
            <Picker.Item label="Selecciona una EPS" value="" />
            {(Array.isArray(epsList) ? epsList : []).map((e) => (
              <Picker.Item key={e.id_eps} label={e.nombre} value={e.id_eps} />
            ))}
          </Picker>
        </View>
        {/* Estado usuario y médico solo en edición */}
        {isEdit && (
          <>
            <TextInput
              style={formStyles.input}
              placeholder="Estado usuario (activo/inactivo)"
              value={estadoUsuario}
              onChangeText={setEstadoUsuario}
            />
            <TextInput
              style={formStyles.input}
              placeholder="Estado médico (activo/inactivo)"
              value={estadoMedico}
              onChangeText={setEstadoMedico}
            />
          </>
        )}
        {error ? <Text style={formStyles.error}>{error}</Text> : null}
        {success ? <Text style={formStyles.success}>{success}</Text> : null}
        <View style={formStyles.actions}>
          <TouchableOpacity style={formStyles.cancelBtn} onPress={onClose} disabled={loading}>
            <Text style={formStyles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={formStyles.saveBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={formStyles.saveBtnText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

const formStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 24,
  },
  input: {
    width: 300,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  selectContainer: {
    width: 300,
    marginBottom: 16,
  },
  selectLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.primary.main,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    height: 44,
  },
  error: {
    color: Colors.error.main,
    marginBottom: 8,
  },
  success: {
    color: Colors.success.main,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: Colors.grey[200],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: Colors.grey[700],
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 