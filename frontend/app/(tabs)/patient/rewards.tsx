import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert, Linking, Clipboard } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { rewardsService, Reward } from '../../../services/rewards';
import { patientService } from '../../../services/patients';
import { LinearGradient } from 'expo-linear-gradient';

export default function RewardsScreen() {
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [patientPoints, setPatientPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemCode, setRedeemCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Recarga automática cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      patientService.getCurrentPatient().then(patientData => {
        setPatientPoints(patientData.puntos || 0);
      });
    }, 10000);
    return () => clearInterval(interval);
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
      setPatientId(patientData.id_paciente);
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

  // Función para generar un código aleatorio
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  // Función para canjear recompensa
  const handleRedeem = async (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;
    if (patientPoints < selectedReward.puntos_necesarios) {
      Alert.alert('No tienes suficientes puntos para canjear esta recompensa.');
      setShowRedeemModal(false);
      return;
    }
    if (!patientId) {
      Alert.alert('Error', 'No se pudo identificar al paciente.');
      setShowRedeemModal(false);
      return;
    }
    try {
      await patientService.subtractPoints(patientId, selectedReward.puntos_necesarios);
      setRedeemCode(generateCode());
    } catch (error) {
      Alert.alert('Error', 'No se pudo canjear la recompensa.');
      setShowRedeemModal(false);
    }
  };

  // Función simplificada para usar la misma imagen de cupón para todas las recompensas
  const getImageForReward = () => {
    return require('../../../assets/images/cupon.jpg');
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
            <View style={styles.imageContainer}>
              <Image
                source={getImageForReward()}
                style={styles.rewardImage}
                resizeMode="contain"
              />
              <View style={styles.pointsBadge}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.gradientBadge}
                >
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.pointsBadgeText}>
                    {reward.puntos_necesarios.toLocaleString()} pts
                  </Text>
                </LinearGradient>
              </View>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.nombre}</Text>
              <TouchableOpacity
                style={{ marginTop: 10, backgroundColor: Colors.primary.main, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}
                onPress={() => handleRedeem(reward)}
                disabled={patientPoints < reward.puntos_necesarios}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                  Canjear
                </Text>
              </TouchableOpacity>
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
          <Ionicons name="star" size={22} color="#FFD700" />
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
      {/* Modal de canje */}
      {showRedeemModal && selectedReward && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' }}>
            {!redeemCode ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                  ¿Estás seguro que deseas canjear la recompensa "{selectedReward.nombre}"?
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary.main, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 16, width: '100%' }}
                  onPress={confirmRedeem}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Sí, canjear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginTop: 10 }}
                  onPress={() => { setShowRedeemModal(false); setSelectedReward(null); }}
                >
                  <Text style={{ color: Colors.primary.main, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                  ¡Canje exitoso!
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
                  Has canjeado: <Text style={{ fontWeight: 'bold' }}>{selectedReward.nombre}</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(selectedReward.nombre)}`)}
                  style={{ marginBottom: 10 }}
                >
                  <Text style={{ color: Colors.primary.main, textDecorationLine: 'underline' }}>
                    Ir a la página relacionada
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, marginBottom: 8 }}>Tu código de redención:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 2, color: Colors.primary.main }}>{redeemCode}</Text>
                  <TouchableOpacity onPress={() => { Clipboard.setString(redeemCode); Alert.alert('Copiado', 'Código copiado al portapapeles'); }}>
                    <Ionicons name="copy" size={20} color={Colors.primary.main} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary.main, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, width: '100%' }}
                  onPress={() => { setShowRedeemModal(false); setSelectedReward(null); setRedeemCode(''); }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
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
    fontFamily: 'SpaceMono',
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
    fontSize: 20,
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
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  rewardInfo: {
    padding: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey[800],
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
  },
  pointsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  gradientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointsBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 