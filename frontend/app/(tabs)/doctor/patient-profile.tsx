import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { patientService } from '../../../services/patients';
import { appointmentsService } from '../../../services/appointments';
import { useAuth } from '../../../hooks/useAuth';
import { pointsService } from '../../../services/points';
import { doctorService } from '../../../services/doctors';

export default function PatientProfile() {
  const params = useLocalSearchParams();
  console.log('Params recibidos en patient-profile:', params);
  const { pacienteId, citaId } = params;
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
  const [doctorData, setDoctorData] = useState<any>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingNoShow, setLoadingNoShow] = useState(false);
  const [showSuccessCancelModal, setShowSuccessCancelModal] = useState(false);
  const [showSuccessNoShowModal, setShowSuccessNoShowModal] = useState(false);

  // Cargar datos del paciente
  const loadPatient = async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    try {
      const data = await patientService.getPatientById(Number(pacienteId));
      console.log('Datos del paciente recibidos:', JSON.stringify(data, null, 2));
      setPatient(data);
    } catch (e) {
      console.error('Error cargando paciente:', e);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos del médico actual
  const loadDoctorData = async () => {
    if (!user?.id_usuario) return;
    
    try {
      const data = await doctorService.getCurrentDoctor();
      console.log('Datos del médico actual:', data);
      setDoctorData(data);
      return data;
    } catch (e) {
      console.error('Error cargando datos del médico:', e);
      return null;
    }
  };

  // Cargar citas del paciente
  const loadAppointments = async () => {
    if (!pacienteId || !user?.id_usuario) return;
    
    setLoadingAppointments(true);
    try {
      console.log('Cargando citas para paciente:', pacienteId, 'usuario:', user.id_usuario);
      const allCitas = await appointmentsService.getPatientAppointments(Number(pacienteId));
      console.log('Todas las citas del paciente:', allCitas);
      
      // Usar datos del médico cacheados o cargarlos si no están disponibles
      let currentDoctorData = doctorData;
      if (!currentDoctorData) {
        currentDoctorData = await loadDoctorData();
      }
      
      if (currentDoctorData?.id_medico) {
        const myCitas = allCitas.filter((c: any) => c.medico === currentDoctorData.id_medico);
        console.log('Citas filtradas para este médico (id_medico:', currentDoctorData.id_medico, '):', myCitas);
        setAppointments(myCitas);
        
        if (citaId && !selectedAppointment) {
          const cita = myCitas.find((c: any) => String(c.id_cita) === String(citaId));
          setSelectedAppointment(cita || null);
        }
      } else {
        console.error('No se pudo obtener el id_medico del usuario actual');
        setAppointments([]);
      }
    } catch (e) {
      console.error('Error cargando citas:', e);
      setAppointments([]);
      if (!citaId) setSelectedAppointment(null);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Cargar cita específica por ID
  const loadSelectedAppointmentById = async () => {
    if (!citaId) return;
    
    try {
      const cita = await appointmentsService.getAppointmentById(Number(citaId));
      console.log('Cita obtenida por id:', cita);
      setSelectedAppointment(cita);
    } catch (e) {
      console.error('Error obteniendo cita por id:', e);
      setSelectedAppointment(null);
    }
  };

  // useEffect principal - maneja la carga inicial
  useEffect(() => {
    const initializeData = async () => {
      console.log('Inicializando datos - pacienteId:', pacienteId, 'user:', user?.id_usuario, 'authLoading:', authLoading);
      
      // Solo proceder si no estamos cargando autenticación y tenemos pacienteId
      if (authLoading || !pacienteId) return;
      
      // Cargar datos del médico primero (necesario para el filtro de citas)
      if (user?.id_usuario) {
        await loadDoctorData();
      }
      
      // Cargar paciente
      await loadPatient();
      
      // Cargar citas si tenemos usuario
      if (user?.id_usuario) {
        await loadAppointments();
      }
      
      // Cargar cita específica si tenemos citaId
      if (citaId) {
        await loadSelectedAppointmentById();
      }
    };

    initializeData();
  }, [pacienteId, user?.id_usuario, citaId, authLoading]);

  // useEffect separado para recargar citas cuando el usuario cambie
  useEffect(() => {
    if (user?.id_usuario && pacienteId && !authLoading) {
      loadAppointments();
    }
  }, [user?.id_usuario, pacienteId, authLoading]);

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
      if (action === 'no_asistio') {
        setLoadingNoShow(true);
        try {
          await appointmentsService.markNoShow(citaId);
          setShowSuccessNoShowModal(true);
          await loadAppointments();
        } finally {
          setLoadingNoShow(false);
        }
      }
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
      setLoadingCancel(true);
      try {
        await appointmentsService.cancelAppointment(cancelCitaId, 'medico', cancelReason);
        setSelectedAppointment(null);
        setShowCancelModal(false);
        setCancelReason('');
        setCancelCitaId(null);
        await loadAppointments(); // Recargar citas después de cancelar
        setShowSuccessCancelModal(true); // Mostrar confirmación de éxito
      } catch (e) {
        alert('Error al cancelar la cita');
      } finally {
        setLoadingCancel(false);
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

  // Mostrar loading mientras se cargan los datos iniciales
  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>
          {authLoading ? 'Verificando autenticación...' : 'Cargando perfil del paciente...'}
        </Text>
      </View>
    );
  }

  const patientName = patient?.nombre || patient?.usuario_data?.nombre || '';
  const patientLastName = patient?.apellido || patient?.usuario_data?.apellido || '';
  const doctorName = user?.nombre || '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              Dr(a). {doctorName}
            </Text>
            <Text style={styles.headerSubtitle}>
              Perfil del Paciente
            </Text>
          </View>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil del Paciente</Text>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{patientName} {patientLastName}</Text>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{patient?.correo || patient?.usuario_data?.correo}</Text>
        
        {/* Citas con este médico */}
        <Text style={styles.sectionTitle}>Citas con este paciente</Text>
        
        {/* Loading para citas */}
        {loadingAppointments ? (
          <View style={styles.appointmentsLoading}>
            <ActivityIndicator size="small" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <Text style={styles.emptyText}>No hay citas programadas con este paciente.</Text>
        ) : (
          appointments.map((cita) => (
            <View
              key={cita.id_cita}
              style={[
                styles.citaItem,
                cita.estado === 'cancelada' && styles.citaItemCancelled,
              ]}
            >
              <Text
                style={[
                  styles.citaText,
                  cita.estado === 'cancelada' && styles.cancelledText,
                ]}
              >
                {cita.fecha_cita} | {cita.hora_inicio} - {cita.hora_fin}
              </Text>
              <Text
                style={[
                  styles.citaText,
                  cita.estado === 'cancelada' && styles.cancelledText,
                ]}
              >
                Estado: {cita.estado === 'cancelada' ? 'Cancelado' : cita.estado}
              </Text>
              {cita.estado === 'cancelada' && (
                <Text style={styles.cancelledReason}>
                  Motivo: {cita.motivo_cancelacion}
                </Text>
              )}
              {cita.estado !== 'cancelada' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, loadingCancel && styles.actionBtnDisabled]}
                    onPress={() => handleAction('cancelar', cita.id_cita)}
                    disabled={loadingCancel}
                  >
                    <Text style={styles.actionText}>
                      {loadingCancel ? 'Cancelando...' : 'Cancelar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, loadingNoShow && styles.actionBtnDisabled]}
                    onPress={() => handleAction('no_asistio', cita.id_cita)}
                    disabled={loadingNoShow}
                  >
                    <Text style={styles.actionText}>
                      {loadingNoShow ? 'Marcando...' : 'No asistió'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
        
        {/* Botones de acción */}
        {(!selectedAppointment || selectedAppointment.estado !== 'cancelada') && (
          <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/(tabs)/doctor/assign-task', params: { pacienteId } })}>
            <Text style={styles.buttonText}>Asignar Tarea/Diagnóstico</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.button, { backgroundColor: '#22c55e' }]} onPress={() => setShowPointsModal(true)}>
          <Text style={styles.buttonText}>Asignar Puntos</Text>
        </TouchableOpacity>

        {/* Modal para cancelar cita */}
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

        {/* Modal de éxito para puntos */}
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

        {/* Modal de éxito para cancelar cita */}
        <Modal
          visible={showSuccessCancelModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: 'center' }]}> 
              <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
              <Text style={[styles.modalTitle, { color: '#22c55e', textAlign: 'center' }]}>¡Cita cancelada correctamente!</Text>
              <Text style={[styles.modalText, { textAlign: 'center', marginBottom: 20 }]}>
                La cita ha sido cancelada y el paciente será notificado.
              </Text>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#22c55e', marginTop: 20, width: 120 }]}
                onPress={() => setShowSuccessCancelModal(false)}
              >
                <Text style={styles.modalBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de éxito para marcar como no asistió */}
        <Modal
          visible={showSuccessNoShowModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessNoShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: 'center' }]}> 
              <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
              <Text style={[styles.modalTitle, { color: '#22c55e', textAlign: 'center' }]}>¡Paciente marcado como no asistió!</Text>
              <Text style={[styles.modalText, { textAlign: 'center', marginBottom: 20 }]}>
                El estado de la cita ha sido actualizado correctamente.
              </Text>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#22c55e', marginTop: 20, width: 120 }]}
                onPress={() => setShowSuccessNoShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    padding: 0,
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey[600],
    textAlign: 'center',
  },
  appointmentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: 16,
    fontFamily: 'serif',
  },
  content: { 
    padding: 24, 
    backgroundColor: Colors.light.background,
    flexGrow: 1,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary.main, marginBottom: 16 },
  label: { fontWeight: 'bold', color: Colors.primary.main, marginTop: 8 },
  value: { fontSize: 16, color: Colors.grey[800], marginBottom: 4 },
  button: { backgroundColor: Colors.primary.main, padding: 16, borderRadius: 8, marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  emptyText: { color: Colors.grey[500], fontStyle: 'italic', marginBottom: 12, textAlign: 'center' },
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
  actionBtnDisabled: { backgroundColor: Colors.grey[300] },
  modalText: { 
    fontSize: 14, 
    color: Colors.grey[600], 
    textAlign: 'center', 
    marginBottom: 20 
  },
}); 