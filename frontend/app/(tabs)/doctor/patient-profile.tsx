import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { patientService } from '../../../services/patients';
import { appointmentsService } from '../../../services/appointments';
import { useAuth } from '../../../hooks/useAuth';
import { pointsService } from '../../../services/points';

export default function PatientProfile() {
  const params = useLocalSearchParams();
  console.log('Params recibidos en patient-profile:', params);
  const { pacienteId, citaId } = params;
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCitaId, setCancelCitaId] = useState<number | null>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [puntos, setPuntos] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (pacienteId) loadPatient();
    if (pacienteId && user?.id_usuario) loadAppointments();
    if (citaId) {
      loadSelectedAppointmentById();
    }
  }, [pacienteId, user, citaId]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const data = await patientService.getPatientById(Number(pacienteId));
      console.log('Datos del paciente recibidos:', JSON.stringify(data, null, 2));
      setPatient(data);
    } catch (e) {
      console.error('Error cargando paciente:', e);
      // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const allCitas = await appointmentsService.getPatientAppointments(Number(pacienteId));
      const myCitas = allCitas.filter((c: any) => c.medico === user?.id_usuario);
      setAppointments(myCitas);
      if (citaId && !selectedAppointment) {
        // Si no se cargó la cita por id, intentar encontrarla en la lista
        const cita = myCitas.find((c: any) => String(c.id_cita) === String(citaId));
        setSelectedAppointment(cita || null);
      }
    } catch (e) {
      setAppointments([]);
      if (!citaId) setSelectedAppointment(null);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadSelectedAppointmentById = async () => {
    try {
      const cita = await appointmentsService.getAppointmentById(Number(citaId));
      console.log('Cita obtenida por id:', cita);
      setSelectedAppointment(cita);
    } catch (e) {
      console.error('Error obteniendo cita por id:', e);
      setSelectedAppointment(null);
    }
  };

  const handleAction = async (action: string, citaId: number) => {
    try {
      if (action === 'confirmar') await appointmentsService.confirmAppointment(citaId);
      if (action === 'cancelar') {
        setCancelCitaId(citaId);
        setShowCancelModal(true);
        return;
      }
      if (action === 'iniciar') await appointmentsService.startAppointment(citaId);
      if (action === 'completar') await appointmentsService.completeAppointment(citaId);
      if (action === 'no_asistio') await appointmentsService.markNoShow(citaId);
      await loadAppointments();
    } catch (e) {
      alert('Error al realizar la acción');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Debes ingresar un motivo para cancelar la cita.');
      return;
    }
    if (cancelCitaId) {
      try {
        await appointmentsService.cancelAppointment(cancelCitaId, 'medico', cancelReason);
        setSelectedAppointment(null);
        setShowCancelModal(false);
        setCancelReason('');
        setCancelCitaId(null);
      } catch (e) {
        alert('Error al cancelar la cita');
      }
    }
  };

  const handleAsignarPuntos = async () => {
    if (!puntos || !descripcion) {
      alert('Completa todos los campos');
      return;
    }
    setLoadingPoints(true);
    try {
      await pointsService.asignarPuntos({
        paciente: Number(pacienteId),
        puntos: Number(puntos),
        descripcion,
      });
      setShowPointsModal(false);
      setPuntos('');
      setDescripcion('');
      setShowSuccessModal(true);
    } catch (e) {
      alert('Error al asignar puntos');
    } finally {
      setLoadingPoints(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginTop: 32 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil del Paciente</Text>
      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.value}>{patient?.nombre || patient?.usuario_data?.nombre} {patient?.apellido || patient?.usuario_data?.apellido}</Text>
      <Text style={styles.label}>Correo:</Text>
      <Text style={styles.value}>{patient?.correo || patient?.usuario_data?.correo}</Text>
      {/* Citas con este médico */}
      <Text style={styles.sectionTitle}>Citas con este paciente</Text>
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Estás seguro que deseas cancelar la cita?</Text>
            <Text style={styles.modalWarning}>Esta acción no se puede deshacer.</Text>
            <Text style={styles.modalLabel}>Motivo de cancelación:</Text>
            <TextInput
              style={styles.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Escribe el motivo..."
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc', marginRight: 12 }]} onPress={() => { setShowCancelModal(false); setCancelReason(''); setCancelCitaId(null); }}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.error.main }]} onPress={handleConfirmCancel}>
                <Text style={styles.modalBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {selectedAppointment && (
        <View style={[styles.citaItem, selectedAppointment.estado === 'cancelada' && styles.citaItemCancelled]}>
          <Text style={[styles.citaText, selectedAppointment.estado === 'cancelada' && styles.cancelledText]}>{selectedAppointment.fecha_cita} | {selectedAppointment.hora_inicio} - {selectedAppointment.hora_fin}</Text>
          <Text style={[styles.citaText, selectedAppointment.estado === 'cancelada' && styles.cancelledText]}>
            Estado: {selectedAppointment.estado === 'cancelada' ? 'Cancelado' : selectedAppointment.estado}
          </Text>
          {selectedAppointment.estado === 'cancelada' && (
            <Text style={styles.cancelledReason}>Motivo: {selectedAppointment.motivo_cancelacion}</Text>
          )}
          {selectedAppointment.estado !== 'cancelada' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('cancelar', selectedAppointment.id_cita)}>
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('no_asistio', selectedAppointment.id_cita)}>
                <Text style={styles.actionText}>No asistió</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {(!selectedAppointment || selectedAppointment.estado !== 'cancelada') && (
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/(tabs)/doctor/assign-task', params: { pacienteId } })}>
          <Text style={styles.buttonText}>Asignar Tarea/Diagnóstico</Text>
        </TouchableOpacity>
      )}
      {/* Botón para abrir el modal de asignar puntos */}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#22c55e' }]} onPress={() => setShowPointsModal(true)}>
        <Text style={styles.buttonText}>Asignar Puntos</Text>
      </TouchableOpacity>
      {/* Modal para asignar puntos */}
      <Modal
        visible={showPointsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPointsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Asignar puntos al paciente</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Cantidad de puntos"
              keyboardType="numeric"
              value={puntos}
              onChangeText={setPuntos}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc', marginRight: 12 }]} onPress={() => setShowPointsModal(false)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#22c55e' }]} onPress={handleAsignarPuntos} disabled={loadingPoints}>
                <Text style={styles.modalBtnText}>{loadingPoints ? 'Asignando...' : 'Asignar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de éxito */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}> 
            <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
            <Text style={[styles.modalTitle, { color: '#22c55e', textAlign: 'center' }]}>¡Puntos asignados correctamente!</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#22c55e', marginTop: 20, width: 120 }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalBtnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: Colors.light.background },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  label: { fontWeight: 'bold', color: Colors.primary.main, marginTop: 8 },
  value: { fontSize: 16, color: Colors.grey[800], marginBottom: 4 },
  button: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8, marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  emptyText: { color: Colors.grey[500], fontStyle: 'italic', marginBottom: 12 },
  citaItem: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 10 },
  citaText: { fontSize: 15, color: Colors.grey[800] },
  actionBtn: { backgroundColor: Colors.primary.main, padding: 8, borderRadius: 6, marginRight: 8, marginBottom: 4 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 340, maxWidth: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.error.main, marginBottom: 8 },
  modalWarning: { color: Colors.error.main, marginBottom: 12 },
  modalLabel: { fontWeight: 'bold', marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, minHeight: 48, textAlignVertical: 'top', marginBottom: 8 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  citaItemCancelled: { backgroundColor: '#ffeaea', borderColor: Colors.error.main, borderWidth: 1 },
  cancelledText: { color: Colors.error.main, fontWeight: 'bold' },
  cancelledReason: { color: Colors.error.main, fontStyle: 'italic', marginTop: 4 },
}); 