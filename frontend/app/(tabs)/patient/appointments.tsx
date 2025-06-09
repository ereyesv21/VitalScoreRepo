import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { Colors } from '../../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Appointments() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Mis Citas</ThemedText>
        <ThemedText style={styles.subtitle}>Programa y gestiona tus citas médicas</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Próximas Citas</ThemedText>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-clock" size={48} color={Colors.primary.dark} />
            <ThemedText style={styles.emptyStateText}>
              No tienes citas programadas
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Historial de Citas</ThemedText>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={48} color={Colors.primary.dark} />
            <ThemedText style={styles.emptyStateText}>
              No hay citas anteriores
            </ThemedText>
          </View>
        </View>

        <Pressable style={styles.addButton}>
          <MaterialCommunityIcons name="calendar-plus" size={24} color={Colors.text.light} />
          <ThemedText style={styles.addButtonText}>Agendar Nueva Cita</ThemedText>
        </Pressable>
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
    padding: 20,
    backgroundColor: Colors.primary.dark,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.light,
    opacity: 0.8,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.dark,
  },
  emptyState: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.dark,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 