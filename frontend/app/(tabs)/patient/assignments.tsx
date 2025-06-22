import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { tasksService, Task } from '../../../services/tasks';
import { patientService } from '../../../services/patients';

// Función para formatear la fecha a un formato legible
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora '0' debe ser '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  } catch (error) {
    return 'Hora inválida';
  }
};

const getIconForTask = (taskName: string): string => {
  const name = taskName.toLowerCase();
  if (name.includes('medicamento')) return 'pills';
  if (name.includes('ejercicio') || name.includes('caminata')) return 'running';
  if (name.includes('presión') || name.includes('medir')) return 'heartbeat';
  if (name.includes('desayuno') || name.includes('comida')) return 'utensils';
  return 'clipboard-check';
};

const TaskItem = ({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) => {
  const isCompleted = task.estado?.toLowerCase() === 'completada';

  return (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => !isCompleted && onComplete(task.id_tarea)} disabled={isCompleted}>
        <FontAwesome5
          name={isCompleted ? 'check-circle' : 'circle'}
          size={24}
          color={isCompleted ? Colors.success.main : Colors.grey[300]}
        />
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskName, isCompleted && styles.taskCompleted]}>
          {task.nombre_tarea}
        </Text>
        <Text style={styles.taskDescription}>{task.descripcion}</Text>
      </View>
      {!isCompleted && (
        <TouchableOpacity style={styles.completeButton} onPress={() => onComplete(task.id_tarea)}>
          <Text style={{color: Colors.primary.main}}>Completar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function PatientAssignments() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Hoy');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const patientData = await patientService.getCurrentPatient();
        if (patientData) {
          setPatientId(patientData.id_paciente);
          setStreak(patientData.racha_dias || 0);
        }
        
        const fetchedTasks = await tasksService.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos iniciales.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleCompleteTask = async (taskId: number) => {
    const originalTasks = [...tasks];
    
    const updatedTasks = tasks.map(task =>
      task.id_tarea === taskId ? { ...task, estado: 'completada' } : task
      );
    setTasks(updatedTasks);
    
    // Check if it was the last pending task *before* the state update
    const pendingTasksBeforeUpdate = originalTasks.filter(t => t.estado?.toLowerCase() !== 'completada');
    const wasLastPending = pendingTasksBeforeUpdate.length === 1 && pendingTasksBeforeUpdate[0].id_tarea === taskId;

    try {
      await tasksService.completeTask(taskId);

      if (wasLastPending && patientId) {
        const streakResult = await patientService.updateStreak(patientId);
        setStreak(streakResult.racha);
        Alert.alert("¡Racha Actualizada!", streakResult.mensaje);
      }

    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la tarea. Inténtalo de nuevo.');
      setTasks(originalTasks);
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (activeFilter === 'Hoy') {
      return tasks.filter(task => {
        const taskDate = new Date(task.fecha_fin);
        return taskDate >= startOfToday && taskDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
      });
    }

    if (activeFilter === 'Semana') {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Lunes como inicio de semana
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      return tasks.filter(task => {
        const taskDate = new Date(task.fecha_fin);
        return taskDate >= startOfWeek && taskDate < endOfWeek;
      });
    }

    return tasks; // 'Todas'
  }, [tasks, activeFilter]);

  const pendingTasks = filteredTasks.filter(t => t.estado?.toLowerCase() === 'pendiente');
  const completedTasks = filteredTasks.filter(t => t.estado?.toLowerCase() === 'completada');

  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <View style={styles.header}>
            <FontAwesome5 name="clipboard-check" size={28} color={Colors.light.background} />
            <Text style={styles.title}>Mis Tareas</Text>
          </View>
          <Text style={styles.subtitle}>Completa tareas para ganar puntos VitalScore</Text>
        </View>
        <Text style={styles.logoText}>VitalScore</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary.main} />
        ) : (
          <ScrollView>
            <View style={styles.card}>
              <View style={styles.streakContainer}>
                <FontAwesome5 name="fire" size={24} color="#FFFFFF" />
                <Text style={styles.streakText}>{streak} días de racha</Text>
              </View>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Tareas Diarias</Text>
                <Text style={styles.progressText}>
                  {completedTasks.length}/{tasks.length}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
              <View style={styles.filterContainer}>
                {['Hoy', 'Semana', 'Todas'].map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      activeFilter === filter && styles.filterButtonActive,
                    ]}
                    onPress={() => setActiveFilter(filter)}>
                    <Text style={[
                      styles.filterButtonText,
                      activeFilter === filter && styles.filterButtonTextActive,
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <TaskItem key={task.id_tarea} task={task} onComplete={handleCompleteTask} />
                ))
              ) : (
                <Text style={styles.emptyText}>No tienes tareas pendientes para {activeFilter.toLowerCase()}.</Text>
              )}
            </View>

            {completedTasks.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Tareas Completadas ({completedTasks.length})</Text>
                </View>
                {completedTasks.map(task => (
                  <TaskItem key={task.id_tarea} task={task} onComplete={() => {}} />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.background,
    marginLeft: 12,
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.background,
    fontFamily: 'SpaceMono',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.background,
    fontFamily: 'SpaceMono',
    marginRight: 40,
    transform: [{ translateY: -15 }],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6D00',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#FF6D00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.grey[800],
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary.main,
  },
  progressContainer: {
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.main,
    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey[600],
  },
  filterButtonTextActive: {
    color: Colors.light.background,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.grey[200],
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.secondary.main,
    borderRadius: 6,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[100],
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grey[800],
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.grey[600],
    marginTop: 4,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.grey[500],
  },
  completeButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: Colors.grey[500],
  },
}); 