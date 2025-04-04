import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animal } from '@/types/animal';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default function Dashboard() {
  const router = useRouter();
  const [livestockData, setLivestockData] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer 2 animaux depuis Firestore
  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        const q = query(collection(db, 'livestock'), limit(2));
        const querySnapshot = await getDocs(q);
        
        const animals: Animal[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          animals.push({
            id: doc.id,
            name: data.name,
            type: data.type,
            age: data.age,
            health: data.health || 'healthy',
            photoBase64: data.photoBase64,
            lastCheck: ''
          });
        });

        setLivestockData(animals);
      } catch (error) {
        console.error("Erreur de récupération:", error);
        Alert.alert("Erreur", "Impossible de charger les données du bétail");
      } finally {
        setLoading(false);
      }
    };

    fetchLivestock();
  }, []);

  // Données simulées (remplacez par vos données réelles plus tard)
  const weatherData = {
    temperature: '24°C',
    humidity: '65%',
    forecast: 'Ensoleillé',
  };

  const soilData = {
    moisture: '45%',
    quality: 'Bonne',
    ph: '6.2',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e8b57" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="settings-outline" size={24} color="#2e8b57" />
        </TouchableOpacity>
      </View>

      {/* Carte Météo */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/weather')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="partly-sunny-outline" size={24} color="#2e8b57" />
          <Text style={styles.cardTitle}>Météo actuelle</Text>
        </View>
        <View style={styles.weatherGrid}>
          <View style={styles.weatherItem}>
            <Text style={styles.weatherLabel}>Température</Text>
            <Text style={styles.weatherValue}>{weatherData.temperature}</Text>
          </View>
          <View style={styles.weatherItem}>
            <Text style={styles.weatherLabel}>Humidité</Text>
            <Text style={styles.weatherValue}>{weatherData.humidity}</Text>
          </View>
          <View style={styles.weatherItem}>
            <Text style={styles.weatherLabel}>Prévision</Text>
            <Text style={styles.weatherValue}>{weatherData.forecast}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Carte Sol */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/soil')}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="leaf-outline" size={24} color="#2e8b57" />
          <Text style={styles.cardTitle}>État du sol</Text>
        </View>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Humidité</Text>
            <Text style={styles.dataValue}>{soilData.moisture}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Qualité</Text>
            <Text style={styles.dataValue}>{soilData.quality}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>pH</Text>
            <Text style={styles.dataValue}>{soilData.ph}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Carte Bétail */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="paw-outline" size={24} color="#2e8b57" />
          <Text style={styles.cardTitle}>Bétail récent</Text>
        </View>
        
        {livestockData.length > 0 ? (
          livestockData.map((animal) => (
            <View key={animal.id} style={styles.livestockItem}>
              {animal.photoBase64 ? (
                <Image 
                  source={{ uri: animal.photoBase64 }} 
                  style={styles.animalThumbnail} 
                />
              ) : (
                <View style={styles.animalThumbnailPlaceholder}>
                  <Ionicons name="paw" size={20} color="#6c757d" />
                </View>
              )}
              
              <View style={styles.livestockInfo}>
                <Text style={styles.livestockName}>{animal.name}</Text>
                <Text style={styles.livestockType}>{animal.type} • {animal.age}</Text>
              </View>
              
              <View style={[
                styles.healthBadge,
                animal.health === 'healthy' ? styles.healthyBadge :
                animal.health === 'warning' ? styles.warningBadge :
                styles.criticalBadge
              ]}>
                <Text style={styles.healthBadgeText}>
                  {animal.health === 'healthy' ? '✅ Bonne santé' :
                   animal.health === 'warning' ? '⚠️ À surveiller' : '❌ Critique'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Aucun animal enregistré</Text>
        )}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/livestock')}
        >
          <Text style={styles.addButtonText}>Voir tout le bétail</Text>
        </TouchableOpacity>
      </View>


      {/* Actions rapides */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="water-outline" size={30} color="#2e8b57" />
          <Text style={styles.actionLabel}>Irrigation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="calendar-outline" size={30} color="#2e8b57" />
          <Text style={styles.actionLabel}>Tâches</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="document-text-outline" size={30} color="#2e8b57" />
          <Text style={styles.actionLabel}>Rapports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 14,
    color: '#666',
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  livestockStatus: {
    fontSize: 14,
  },
  success: {
    color: '#2e8b57',
  },
  warning: {
    color: '#ffa500',
  },
  addButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#2e8b57',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#fff',
    width: '30%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  livestockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  animalThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  animalThumbnailPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  livestockInfo: {
    flex: 1,
  },
  livestockName: {
    fontWeight: '600',
    fontSize: 16,
  },
  livestockType: {
    color: '#6c757d',
    fontSize: 14,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthyBadge: {
    backgroundColor: '#d4edda',
  },
  warningBadge: {
    backgroundColor: '#fff3cd',
  },
  criticalBadge: {
    backgroundColor: '#f8d7da',
  },
  healthBadgeText: {
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    padding: 16,
    color: '#6c757d',
  },
});