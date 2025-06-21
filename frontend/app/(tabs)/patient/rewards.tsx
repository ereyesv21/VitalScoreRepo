import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { rewardsService, Reward } from '../../../services/rewards';
import { patientService } from '../../../services/patients';

export default function RewardsScreen() {
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [patientPoints, setPatientPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSearch();
  }, [searchQuery, filter, allRewards]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsData, patientData] = await Promise.all([
        rewardsService.getRewards(),
        patientService.getCurrentPatient()
      ]);
      setAllRewards(rewardsData);
      setFilteredRewards(rewardsData);
      setPatientPoints(patientData.puntos || 0);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos de recompensas.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterAndSearch = () => {
    let tempRewards = [...allRewards];

    // Filtering logic
    if (filter === 'Disponibles') {
      tempRewards = tempRewards.filter(r => patientPoints >= r.puntos_necesarios);
    } else if (filter === 'Premium') {
      // Assuming 'Premium' are those with higher points. This can be adjusted.
      tempRewards = tempRewards.filter(r => r.puntos_necesarios > 1000);
    }

    // Search logic
    if (searchQuery.length > 0) {
      tempRewards = tempRewards.filter(r =>
        r.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRewards(tempRewards);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Cargando recompensas...</Text>
        </View>
      );
    }

    if (filteredRewards.length === 0) {
      return (
        <View style={styles.centered}>
          <FontAwesome5 name="gift" size={50} color={Colors.grey[400]} />
          <Text style={styles.emptyTitle}>No se encontraron recompensas</Text>
          <Text style={styles.emptySubtitle}>Prueba con otros filtros o vuelve más tarde</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {filteredRewards.map(reward => (
          <View key={reward.id_recompensa} style={styles.rewardCard}>
            <Image 
              source={{ uri: `https://picsum.photos/seed/${reward.id_recompensa}/300/200` }} 
              style={styles.rewardImage} 
            />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.nombre}</Text>
              <Text style={styles.rewardProvider}>de {reward.proveedor.nombre}</Text>
              <View style={styles.pointsTag}>
                <Ionicons name="star" size={14} color={Colors.primary.main} />
                <Text style={styles.pointsValue}>{reward.puntos_necesarios.toLocaleString()} pts</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recompensas</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{patientPoints.toLocaleString()} puntos</Text>
        </View>
      </View>

      <View style={styles.searchAndFilterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.grey[500]} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar recompensas..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filters}>
          {['Todas', 'Disponibles', 'Premium'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[50],
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.contrast,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pointsText: {
    color: Colors.primary.contrast,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchAndFilterContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[200],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey[100],
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
  },
  activeFilter: {
    backgroundColor: Colors.primary.main,
  },
  filterText: {
    color: Colors.grey[800],
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.primary.contrast,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.grey[600],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grey[700],
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.grey[500],
    marginTop: 5,
    textAlign: 'center'
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rewardInfo: {
    padding: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[800],
  },
  rewardProvider: {
    fontSize: 12,
    color: Colors.grey[500],
    marginTop: 2,
    marginBottom: 8,
  },
  pointsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.light,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pointsValue: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
}); 