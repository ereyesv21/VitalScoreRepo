import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert, Modal, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../../constants/Colors';
import { adminService, Doctor, DoctorSchedule } from '../../../services/admin';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminSchedules() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDay, setAddDay] = useState<number>(1);
  const [addStart, setAddStart] = useState('08:00');
  const [addEnd, setAddEnd] = useState('09:00');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHorario, setEditHorario] = useState<DoctorSchedule | null>(null);
  const [editDay, setEditDay] = useState<number>(1);
  const [editStart, setEditStart] = useState('08:00');
  const [editEnd, setEditEnd] = useState('09:00');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteHorarioId, setDeleteHorarioId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) fetchSchedules(selectedDoctor, selectedDate);
    else setSchedules([]);
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const docs = await adminService.getAllDoctors();
      setDoctors(docs);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los médicos');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSchedules = async (doctorId: number, dateObj?: Date) => {
    setLoadingSchedules(true);
    try {
      let horarios = [];
      const dateStr = (dateObj || selectedDate).toISOString().split('T')[0];
      horarios = await adminService.getDoctorAvailableSchedules(doctorId, dateStr);
      setSchedules(horarios);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los horarios');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleAddHorario = async () => {
    setAddError('');
    if (!selectedDoctor) return;
    if (!addStart || !addEnd) {
      setAddError('Debes ingresar hora de inicio y fin');
      return;
    }
    if (addStart >= addEnd) {
      setAddError('La hora de inicio debe ser menor que la de fin');
      return;
    }
    // Validar solapamiento
    const overlapping = schedules.some((h: any) =>
      h.dia_semana === addDay &&
      ((addStart < h.hora_fin && addEnd > h.hora_inicio))
    );
    if (overlapping) {
      setAddError('Ya existe un horario en esa franja horaria. No se pueden solapar horarios.');
      return;
    }
    setAddLoading(true);
    try {
      await adminService.createSchedule({
        medico: selectedDoctor,
        dia_semana: addDay,
        hora_inicio: addStart,
        hora_fin: addEnd,
      });
      setShowAddModal(false);
      setAddStart('08:00');
      setAddEnd('09:00');
      setAddDay(1);
      fetchSchedules(selectedDoctor, selectedDate);
      Alert.alert('Éxito', 'Horario agregado correctamente');
    } catch (e: any) {
      setAddError(e?.message || 'No se pudo agregar el horario');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteHorario = (id: number) => {
    setDeleteHorarioId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteHorario = async () => {
    if (!deleteHorarioId) return;
    setDeleteLoading(true);
    try {
      console.log('Eliminando horario:', deleteHorarioId);
      await adminService.deleteSchedule(deleteHorarioId);
      console.log('Horario eliminado con éxito');
      setShowDeleteModal(false);
      setShowDeleteSuccess(true);
      if (selectedDoctor) fetchSchedules(selectedDoctor);
    } catch (e: any) {
      setShowDeleteModal(false);
      Alert.alert('Error', e?.message || 'No se pudo eliminar el horario');
    } finally {
      setDeleteLoading(false);
      setDeleteHorarioId(null);
    }
  };

  const openEditModal = (horario: DoctorSchedule) => {
    setEditHorario(horario);
    setEditDay(horario.dia_semana);
    setEditStart(horario.hora_inicio);
    setEditEnd(horario.hora_fin);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditHorario = async () => {
    setEditError('');
    if (!editHorario) return;
    if (!editStart || !editEnd) {
      setEditError('Debes ingresar hora de inicio y fin');
      return;
    }
    if (editStart >= editEnd) {
      setEditError('La hora de inicio debe ser menor que la de fin');
      return;
    }
    setEditLoading(true);
    try {
      console.log('Editando horario:', editHorario.id_horario, {
        dia_semana: editDay,
        hora_inicio: editStart,
        hora_fin: editEnd,
      });
      await adminService.updateSchedule(editHorario.id_horario, {
        dia_semana: editDay,
        hora_inicio: editStart,
        hora_fin: editEnd,
      });
      console.log('Horario editado con éxito');
      setShowEditModal(false);
      setShowEditSuccess(true);
      if (selectedDoctor) fetchSchedules(selectedDoctor);
    } catch (e: any) {
      setEditError(e?.message || 'No se pudo actualizar el horario');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header bonito con flecha y título */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/admin')}>
          <MaterialIcons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Horarios de Médicos</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Selecciona un médico:</Text>
        {loadingDoctors ? (
          <ActivityIndicator size="small" color={Colors.primary.main} />
        ) : (
          <Picker
            selectedValue={selectedDoctor}
            onValueChange={setSelectedDoctor}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Selecciona un médico" value={null} />
            {doctors.map(doc => (
              <Picker.Item
                key={doc.id_medico}
                label={`${doc.usuario_data?.nombre || ''} ${doc.usuario_data?.apellido || ''} - ${doc.especialidad_nombre || 'Sin especialidad'}`}
                value={doc.id_medico}
              />
            ))}
          </Picker>
        )}
        <Text style={styles.label}>Selecciona una fecha:</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            style={{ marginBottom: 8, padding: 8, borderRadius: 8, borderColor: '#ccc', borderWidth: 1, width: '100%' }}
          />
        ) : (
          <>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateBtnText}>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, d) => { setShowDatePicker(false); if (d) setSelectedDate(d); }}
                minimumDate={new Date()}
              />
            )}
          </>
        )}
        {/* Botón de refrescar */}
        {selectedDoctor && (
          <TouchableOpacity style={styles.addBtn} onPress={() => fetchSchedules(selectedDoctor, selectedDate)}>
            <Text style={styles.addBtnText}>Refrescar horarios</Text>
          </TouchableOpacity>
        )}
        {selectedDoctor && (
          <View style={styles.schedulesSection}>
            <Text style={styles.sectionTitle}>Horarios actuales</Text>
            {(() => { console.log('Schedules en render:', schedules); return null; })()}
            {loadingSchedules ? (
              <ActivityIndicator size="small" color={Colors.primary.main} />
            ) : schedules.length === 0 ? (
              <Text style={styles.emptyText}>No hay horarios registrados para este médico.</Text>
            ) : (
              <FlatList
                data={schedules}
                keyExtractor={item => `${item.hora_inicio}-${item.hora_fin}`}
                renderItem={({ item }) => (
                  <View style={[styles.scheduleItem, !item.disponible && styles.scheduleItemDisabled]}>
                    <Text style={styles.scheduleText}>{getDayName(item.dia_semana)} {item.hora_inicio} - {item.hora_fin}</Text>
                    {item.disponible ? (
                      <Text style={styles.availableText}>Disponible</Text>
                    ) : (
                      <Text style={styles.occupiedText}>Ocupado</Text>
                    )}
                  </View>
                )}
              />
            )}
            {/* Placeholder para agregar horario */}
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addBtnText}>Agregar Horario</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Modal para agregar horario */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>Agregar Horario</Text>
            <Text style={modalStyles.label}>Día de la semana</Text>
            <Picker
              selectedValue={addDay}
              onValueChange={setAddDay}
              style={modalStyles.picker}
            >
              <Picker.Item label="Lunes" value={1} />
              <Picker.Item label="Martes" value={2} />
              <Picker.Item label="Miércoles" value={3} />
              <Picker.Item label="Jueves" value={4} />
              <Picker.Item label="Viernes" value={5} />
              <Picker.Item label="Sábado" value={6} />
              <Picker.Item label="Domingo" value={7} />
            </Picker>
            <Text style={modalStyles.label}>Hora de inicio (HH:mm)</Text>
            <TextInput
              style={modalStyles.input}
              value={addStart}
              onChangeText={setAddStart}
              placeholder="08:00"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
            <Text style={modalStyles.label}>Hora de fin (HH:mm)</Text>
            <TextInput
              style={modalStyles.input}
              value={addEnd}
              onChangeText={setAddEnd}
              placeholder="09:00"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
            {addError ? <Text style={modalStyles.error}>{addError}</Text> : null}
            <View style={modalStyles.actions}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowAddModal(false)} disabled={addLoading}>
                <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleAddHorario} disabled={addLoading}>
                <Text style={modalStyles.saveBtnText}>{addLoading ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal para editar horario */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>Editar Horario</Text>
            <Text style={modalStyles.label}>Día de la semana</Text>
            <Picker
              selectedValue={editDay}
              onValueChange={setEditDay}
              style={modalStyles.picker}
            >
              <Picker.Item label="Lunes" value={1} />
              <Picker.Item label="Martes" value={2} />
              <Picker.Item label="Miércoles" value={3} />
              <Picker.Item label="Jueves" value={4} />
              <Picker.Item label="Viernes" value={5} />
              <Picker.Item label="Sábado" value={6} />
              <Picker.Item label="Domingo" value={7} />
            </Picker>
            <Text style={modalStyles.label}>Hora de inicio (HH:mm)</Text>
            <TextInput
              style={modalStyles.input}
              value={editStart}
              onChangeText={setEditStart}
              placeholder="08:00"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
            <Text style={modalStyles.label}>Hora de fin (HH:mm)</Text>
            <TextInput
              style={modalStyles.input}
              value={editEnd}
              onChangeText={setEditEnd}
              placeholder="09:00"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
            {editError ? <Text style={modalStyles.error}>{editError}</Text> : null}
            <View style={modalStyles.actions}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowEditModal(false)} disabled={editLoading}>
                <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleEditHorario} disabled={editLoading}>
                <Text style={modalStyles.saveBtnText}>{editLoading ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de confirmación de eliminación */}
      <Modal visible={showDeleteModal} animationType="fade" transparent onRequestClose={() => setShowDeleteModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>¿Eliminar horario?</Text>
            <Text style={{ marginBottom: 16 }}>Esta acción no se puede deshacer.</Text>
            <View style={modalStyles.actions}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={confirmDeleteHorario} disabled={deleteLoading}>
                <Text style={modalStyles.saveBtnText}>{deleteLoading ? 'Eliminando...' : 'Eliminar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de éxito tras eliminar */}
      <Modal visible={showDeleteSuccess} animationType="fade" transparent onRequestClose={() => setShowDeleteSuccess(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>¡Horario eliminado!</Text>
            <TouchableOpacity style={[modalStyles.saveBtn, { marginTop: 16 }]} onPress={() => setShowDeleteSuccess(false)}>
              <Text style={modalStyles.saveBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal de éxito tras editar */}
      <Modal visible={showEditSuccess} animationType="fade" transparent onRequestClose={() => setShowEditSuccess(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>¡Horario editado correctamente!</Text>
            <TouchableOpacity style={[modalStyles.saveBtn, { marginTop: 16 }]} onPress={() => setShowEditSuccess(false)}>
              <Text style={modalStyles.saveBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getDayName(dia: number) {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return dias[dia - 1] || `Día ${dia}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 0,
    margin: 0,
  },
  header: {
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  label: {
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
    fontSize: 18,
    marginTop: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey[300],
    marginBottom: 16,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 12,
  },
  pickerItem: {
    fontSize: 16,
    color: Colors.primary.main,
  },
  schedulesSection: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { color: Colors.grey[500], fontStyle: 'italic', marginBottom: 12 },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  scheduleItemDisabled: {
    backgroundColor: '#f8d7da',
    opacity: 0.6,
  },
  scheduleText: {
    fontSize: 15,
    color: Colors.grey[800],
  },
  occupiedText: {
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  addBtn: { backgroundColor: Colors.primary.main, padding: 14, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  dateBtn: {
    backgroundColor: Colors.primary.main,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  dateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  availableText: {
    color: '#388e3c',
    fontWeight: 'bold',
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 320 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  label: { fontWeight: 'bold', color: Colors.primary.main, marginTop: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: Colors.grey[300] },
  picker: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  error: { color: Colors.error.main, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 16 },
  cancelBtn: { backgroundColor: Colors.grey[200], paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  cancelBtnText: { color: Colors.grey[700], fontWeight: 'bold' },
  saveBtn: { backgroundColor: Colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
}); 