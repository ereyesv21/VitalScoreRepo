import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Modal, Platform, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../../constants/Colors';
import { adminService } from '../../../services/admin';
import { appointmentsService } from '../../../services/appointments';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PatientAppointments() {
  // Estados para agendar cita
  const [showModal, setShowModal] = useState(false);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [especialidad, setEspecialidad] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [medico, setMedico] = useState('');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [horario, setHorario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [noHorariosWarning, setNoHorariosWarning] = useState(false);
  const router = useRouter();
  // Estado para las citas del paciente
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCitaId, setCancelCitaId] = useState<number | null>(null);

  useEffect(() => { fetchEspecialidades(); }, []);

  const fetchEspecialidades = async () => {
    try {
      const res = await adminService.getAllSpecialties();
      if (Array.isArray(res)) {
        setEspecialidades(res);
      } else if (Array.isArray(res.data)) {
        setEspecialidades(res.data);
      } else {
        setEspecialidades([]);
      }
    } catch {
      setEspecialidades([]);
    }
  };

  const fetchMedicos = async (esp: string) => {
    setMedicos([]); setMedico('');
    try {
      console.log('Especialidad seleccionada (id):', esp);
      const docs = await adminService.getDoctorsBySpecialty(esp);
      console.log('Médicos recibidos para especialidad', esp, ':', docs);
      setMedicos(Array.isArray(docs) ? docs : []);
    } catch { setMedicos([]); }
  };

  const fetchHorarios = async (medicoId: string, fechaStr: string) => {
    setHorarios([]); 
    setHorario('');
    setNoHorariosWarning(false);
    try {
      // Usar el nuevo endpoint de disponibilidad
      const res = await appointmentsService.getAvailableSlots(Number(medicoId), fechaStr);
      console.log('Horarios disponibles:', res);
      setHorarios(res);
      if (!res || res.length === 0) {
        setNoHorariosWarning(true);
      }
    } catch {
      setHorarios([]); 
      setNoHorariosWarning(true);
    }
  };

  // Cuando cambia especialidad, carga médicos
  useEffect(() => {
    if (especialidad) {
      fetchMedicos(especialidad);
      setNoHorariosWarning(false); // Limpiar advertencia al cambiar especialidad
    }
  }, [especialidad]);

  // Cuando cambia médico o fecha, carga horarios
  useEffect(() => {
    if (medico && fecha) {
      const fechaStr = fecha.toISOString().split('T')[0];
      fetchHorarios(medico, fechaStr);
    } else {
      setNoHorariosWarning(false); // Limpiar advertencia si no hay médico seleccionado
    }
  }, [medico, fecha]);

  // Log para ver el valor de especialidad y médicos en cada render
  React.useEffect(() => {
    console.log('Valor de especialidad:', especialidad);
    console.log('Lista de médicos:', medicos);
  }, [especialidad, medicos]);

  const handleAgendar = async () => {
    setError(''); setSuccess(false);
    if (!especialidad || !medico || !horario || !motivo) {
      setError('Completa todos los campos'); return;
    }
    // Buscar el objeto horario seleccionado
    const horarioObj = horarios.find(h => String(h.id_horario) === String(horario));
    if (!horarioObj) {
      setError('Selecciona un horario válido'); return;
    }
    setLoading(true);
    try {
      const hora_inicio = horarioObj.hora_inicio;
      const hora_fin = horarioObj.hora_fin;
      const userStr = await AsyncStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      // Obtener todos los pacientes
      const pacientes = await adminService.getAllPatients();
      const paciente = pacientes.find((p: any) => {
        if (typeof p.usuario === 'object' && p.usuario !== null) {
          return p.usuario.id_usuario === userData.id_usuario || p.usuario.id === userData.id;
        }
        return p.usuario === userData.id_usuario || p.usuario === userData.id;
      });
      const pacienteId = paciente?.id_paciente;
      if (!pacienteId) {
        setError('No se pudo obtener el id del paciente.');
        setLoading(false);
        return;
      }
      await appointmentsService.createAppointment({
        paciente: pacienteId,
        medico: Number(medico),
        fecha_cita: fecha.toISOString().split('T')[0],
        hora_inicio,
        hora_fin,
        motivo_consulta: motivo,
        estado: 'programada',
      });
      setSuccess(true);
      setShowModal(false);
      setEspecialidad(''); setMedico(''); setHorario(''); setMotivo('');
      // REFRESH horarios después de agendar
      const fechaStr = fecha.toISOString().split('T')[0];
      if (medico && fecha) fetchHorarios(medico, fechaStr);
    } catch (e: any) {
      // Si el error es de llave duplicada (horario ocupado), muestra mensaje amigable
      const backendMsg = e?.response?.data?.detail || e?.message || '';
      if (backendMsg.includes('llave duplicada') || backendMsg.includes('restricción de unicidad')) {
        setError('Ese horario ya no está disponible. Por favor, selecciona otro.');
      } else {
        setError(backendMsg || 'No se pudo agendar la cita');
      }
    } finally { setLoading(false); }
  };

  // Cargar citas del paciente al montar
  useEffect(() => {
    const fetchMyAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const userStr = await AsyncStorage.getItem('user');
        const userData = userStr ? JSON.parse(userStr) : null;
        console.log('Usuario autenticado:', userData);
        const citas = await appointmentsService.getMyAppointments();
        console.log('Citas obtenidas para paciente:', citas);
        setMyAppointments(Array.isArray(citas) ? citas : []);
      } catch {
        setMyAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchMyAppointments();
  }, [success]); // recargar al agendar

  const handleCancel = (citaId: number) => {
    setCancelCitaId(citaId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Debes ingresar un motivo para cancelar la cita.');
      return;
    }
    if (cancelCitaId) {
      try {
        await appointmentsService.cancelAppointment(cancelCitaId, 'paciente', cancelReason);
        setShowCancelModal(false);
        setCancelReason('');
        setCancelCitaId(null);
        // Refrescar citas
        const citas = await appointmentsService.getMyAppointments();
        setMyAppointments(Array.isArray(citas) ? citas : []);
        // REFRESH horarios después de cancelar
        const fechaStr = fecha.toISOString().split('T')[0];
        if (medico && fecha) fetchHorarios(medico, fechaStr);
      } catch (e) {
        alert('Error al cancelar la cita');
      }
    }
  };

  // Detectar si estamos en web
  const isWeb = typeof window !== 'undefined';

  // Cuando se cierra el modal de agendar o cancelar, refrescar horarios si hay médico y fecha
  useEffect(() => {
    if (!showModal && medico && fecha) {
      const fechaStr = fecha.toISOString().split('T')[0];
      fetchHorarios(medico, fechaStr);
    }
  }, [showModal]);
  useEffect(() => {
    if (!showCancelModal && medico && fecha) {
      const fechaStr = fecha.toISOString().split('T')[0];
      fetchHorarios(medico, fechaStr);
    }
  }, [showCancelModal]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.headerTitle}>Mis citas</Text>
          <Text style={styles.subtitle}>Consulta y gestiona tus citas médicas</Text>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} className="appointments-scroll">
        {/* Lista de citas agendadas */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <FontAwesome5 name="calendar-check" size={24} color={Colors.primary.main} style={{ marginRight: 12 }} />
          <Text style={[styles.sectionTitle, { lineHeight: 28 }]}>Mis citas agendadas</Text>
        </View>
        {loadingAppointments ? (
          <ActivityIndicator size="small" color={Colors.primary.main} />
        ) : myAppointments.length === 0 ? (
          <Text style={styles.emptyText}>No tienes citas agendadas.</Text>
        ) : (
          myAppointments.map((cita, i) => {
            return (
              <View key={cita.id_cita || i} style={[styles.citaItem, cita.estado === 'cancelada' && styles.citaItemCancelled]}>
                <Text style={[styles.citaText, cita.estado === 'cancelada' && styles.cancelledText]}>
                  Médico: {cita.medico_data ? `${cita.medico_data.nombre} ${cita.medico_data.apellido}` : ''}
                </Text>
                {cita.medico_data?.especialidad && (
                  <Text style={[styles.citaText, cita.estado === 'cancelada' && styles.cancelledText]}>
                    Especialidad: {cita.medico_data.especialidad}
                  </Text>
                )}
                <Text style={[styles.citaText, cita.estado === 'cancelada' && styles.cancelledText]}>
                  Fecha: {cita.fecha_cita} - {cita.hora_inicio}
                </Text>
                <Text style={[styles.citaText, cita.estado === 'cancelada' && styles.cancelledText]}>
                  Estado: {cita.estado === 'cancelada' ? 'Cancelado' : cita.estado}
                </Text>
                {cita.estado === 'cancelada' && (
                  <Text style={[styles.citaText, styles.cancelledReason]}>Motivo: {cita.motivo_cancelacion}</Text>
                )}
                {cita.estado === 'programada' && (
                  <TouchableOpacity style={styles.cancelBtnSmall} onPress={() => handleCancel(cita.id_cita)}>
                    <Text style={styles.saveBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
        {/* Modal para cancelar cita */}
        <Modal visible={showCancelModal} animationType="fade" transparent onRequestClose={() => setShowCancelModal(false)}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modal}>
              <Text style={modalStyles.title}>¿Estás seguro que deseas cancelar la cita?</Text>
              <Text style={modalStyles.label}>Motivo de cancelación:</Text>
              <View style={modalStyles.inputContainer}>
                <TextInput
                  style={modalStyles.input}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  placeholder="Escribe el motivo..."
                  multiline
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 }}>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: '#ccc', marginRight: 12 }]} onPress={() => { setShowCancelModal(false); setCancelReason(''); setCancelCitaId(null); }}>
                  <Text style={[modalStyles.saveBtnText, { color: '#333' }]}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: Colors.error.main }]} onPress={handleConfirmCancel}>
                  <Text style={modalStyles.saveBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
          <View style={modalStyles.overlay}>
            <View style={[modalStyles.modal, isWeb && { maxWidth: 380, padding: 18 }] }>
              <Text style={modalStyles.title}>Agendar nueva cita</Text>
              <Text style={modalStyles.label}>Especialidad:</Text>
              <View style={modalStyles.inputContainer}>
                {isWeb ? (
                  <select
                    value={especialidad}
                    onChange={e => setEspecialidad(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: `2px solid ${Colors.primary.main}`,
                      fontSize: 15,
                      marginBottom: 8,
                      background: '#f4f8ff',
                      color: '#222',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id_especialidad || esp.id} value={esp.id_especialidad || esp.id}>{esp.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <Picker
                    selectedValue={especialidad}
                    style={styles.picker}
                    onValueChange={(itemValue) => setEspecialidad(itemValue)}
                  >
                    <Picker.Item label="Selecciona una especialidad" value="" />
                    {especialidades.map((esp) => (
                      <Picker.Item key={esp.id_especialidad || esp.id} label={esp.nombre} value={esp.id_especialidad || esp.id} />
                    ))}
                  </Picker>
                )}
              </View>
              <Text style={modalStyles.label}>Médico:</Text>
              <View style={modalStyles.inputContainer}>
                {isWeb ? (
                  <select
                    value={medico}
                    onChange={e => setMedico(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: `2px solid ${Colors.primary.main}`,
                      fontSize: 15,
                      marginBottom: 8,
                      background: '#f4f8ff',
                      color: '#222',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    disabled={!especialidad}
                  >
                    <option value="">Selecciona un médico</option>
                    {medicos.map((doc) => (
                      <option key={doc.id_medico} value={doc.id_medico} label={`${doc.usuario?.nombre ?? ''} ${doc.usuario?.apellido ?? ''}`} />
                    ))}
                  </select>
                ) : (
                  <Picker
                    selectedValue={medico}
                    style={styles.picker}
                    onValueChange={(itemValue) => setMedico(itemValue)}
                    enabled={!!especialidad}
                  >
                    <Picker.Item label="Selecciona un médico" value="" />
                    {medicos.map((doc) => (
                      <Picker.Item key={doc.id_medico} value={doc.id_medico} label={`${doc.usuario?.nombre ?? ''} ${doc.usuario?.apellido ?? ''}`} />
                    ))}
                  </Picker>
                )}
              </View>
              <Text style={modalStyles.label}>Fecha:</Text>
              {isWeb ? (
                <input
                  type="date"
                  value={fecha.toISOString().split('T')[0]}
                  onChange={e => setFecha(new Date(e.target.value))}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    fontSize: 15,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `2px solid ${Colors.primary.main}`,
                    marginBottom: 8,
                    background: '#f4f8ff',
                    color: '#222',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateBtnText}>{fecha.toISOString().split('T')[0]}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && (
                <View style={{ marginBottom: 8 }}>
                  <input
                    type="date"
                    value={fecha.toISOString().split('T')[0]}
                    onChange={e => setFecha(new Date(e.target.value))}
                    style={{ fontSize: 16, padding: 8, borderRadius: 8, borderColor: Colors.primary.main, borderWidth: 1 }}
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ marginTop: 8 }}>
                    <Text style={{ color: Colors.primary.main, textAlign: 'center' }}>Cerrar selector</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={modalStyles.label}>Horario:</Text>
              <View style={modalStyles.inputContainer}>
                {isWeb ? (
                  <select
                    value={horario}
                    onChange={e => {
                      const selectedId = e.target.value;
                      setHorario(selectedId);
                    }}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      fontSize: 15,
                      padding: '8px',
                      borderRadius: '8px',
                      border: `2px solid ${Colors.primary.main}`,
                      marginBottom: 8,
                      background: '#f4f8ff',
                      color: '#222',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    disabled={!medico}
                  >
                    <option value="">Selecciona un horario</option>
                    {horarios.filter(h => h.disponible).map((h, idx) => (
                      <option key={h.id_horario || idx} value={h.id_horario}>
                        {h.hora_inicio} - {h.hora_fin}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Picker
                    selectedValue={horario}
                    style={styles.picker}
                    onValueChange={(itemValue) => setHorario(itemValue)}
                    enabled={!!medico}
                  >
                    <Picker.Item label="Selecciona un horario" value="" />
                    {horarios.filter(h => h.disponible).map((h, idx) => (
                      <Picker.Item key={h.id_horario || idx} label={`${h.hora_inicio} - ${h.hora_fin}`} value={h.id_horario} />
                    ))}
                  </Picker>
                )}
                {medico && horarios.filter(h => h.disponible).length === 0 && (
                  <Text style={{ color: Colors.error.main, marginTop: 4, fontWeight: 'bold', textAlign: 'center' }}>
                    No hay agenda disponible, intente luego
                  </Text>
                )}
              </View>
              <Text style={modalStyles.label}>Motivo de la consulta:</Text>
              <View style={modalStyles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    isWeb && {
                      width: '100%',
                      minWidth: 0,
                      fontSize: 15,
                      padding: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: Colors.primary.main,
                      marginBottom: 8,
                      backgroundColor: '#f4f8ff',
                      color: '#222',
                    }
                  ]}
                  value={motivo}
                  onChangeText={setMotivo}
                  placeholder="Describe el motivo de la consulta"
                  multiline
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 }}>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: '#ccc', marginRight: 12 }]} onPress={() => setShowModal(false)}>
                  <Text style={[modalStyles.saveBtnText, { color: '#333' }]}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: Colors.primary.main }]} onPress={handleAgendar} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.saveBtnText}>Agendar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.agendarBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.agendarBtnText}>Agendar nueva cita</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.primary.main,
  },
  welcomeContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginTop: 4,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
    fontFamily: 'SpaceMono',
    marginLeft: 10,
    marginRight: 20,
  },
  agendarBtn: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8, marginBottom: 24, alignItems: 'center' },
  agendarBtnText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.light.background },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  label: { fontWeight: 'bold', color: Colors.primary.main, marginTop: 8 },
  picker: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, width: 300 },
  dateBtn: { backgroundColor: Colors.primary.main, borderRadius: 8, padding: 12, marginBottom: 8, alignItems: 'center' },
  dateBtnText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: Colors.grey[300], width: 300 },
  error: { color: Colors.error.main, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 16 },
  cancelBtn: { backgroundColor: Colors.grey[200], paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  cancelBtnText: { color: Colors.grey[700], fontWeight: 'bold' },
  saveBtn: { backgroundColor: Colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  warningContainer: { 
    backgroundColor: Colors.warning.main, 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning.dark
  },
  warningText: { 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  emptyText: { color: Colors.grey[500], fontStyle: 'italic', marginBottom: 12 },
  citaItem: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 10 },
  citaText: { fontSize: 15, color: Colors.grey[800] },
  citaItemCancelled: { backgroundColor: '#ffeaea', borderColor: '#d32f2f', borderWidth: 1 },
  cancelledText: { color: '#d32f2f', fontWeight: 'bold' },
  cancelledReason: { color: '#d32f2f', fontStyle: 'italic', marginTop: 4 },
  cancelBtnSmall: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 320 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  saveBtn: { backgroundColor: Colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  label: { 
    fontWeight: 'bold', 
    color: Colors.primary.main, 
    marginTop: 8, 
    textAlign: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    backgroundColor: '#f4f8ff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    width: 320,
    fontSize: 16,
    color: Colors.grey[800],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
}); 