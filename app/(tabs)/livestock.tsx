import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LivestockAddModal from '../components/LiveStockModal';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Animal, AnimalAlert, LivestockData } from '@/types/animal';

export default function LivestockScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'alerts'>('all');
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [livestockData, setLivestockData] = useState<LivestockData>({
      all: [],
      alerts: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  
    const handleEditAnimal = (animal: Animal) => {
      setSelectedAnimal(animal);
      setAddModalVisible(true);
    };

    const handleSaveAnimal = (updatedAnimal: Animal) => {
        setLivestockData(prev => ({
          ...prev,
          all: prev.all.map(a => a.id === updatedAnimal.id ? updatedAnimal : a)
        }));
      };
  
    useEffect(() => {
      setLoading(true);
      
      const q = query(collection(db, 'livestock'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const allAnimals: Animal[] = [];
        const alertAnimals: AnimalAlert[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const animal: Animal = {
            id: doc.id,
            name: data.name,
            type: data.type,
            age: data.age,
            health: data.health || 'healthy',
            lastCheck: formatDate(data.lastCheck?.toDate()),
            photoBase64: data.photoBase64,
            createdAt: data.createdAt?.toDate()
          };
  
          allAnimals.push(animal);
          
          if (animal.health === 'warning' || animal.health === 'critical') {
            const alert: AnimalAlert = {
              id: doc.id,
              name: animal.name,
              issue: animal.health === 'warning' ? 'À surveiller' : 'Problème de santé',
              level: animal.health
            };
            alertAnimals.push(alert);
          }
        });
  
        setLivestockData({
          all: allAnimals,
          alerts: alertAnimals
        });
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    const formatDate = (date?: Date): string => {
      if (!date) return 'Date inconnue';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffHours < 48) {
        return 'Hier';
      } else {
        return `Il y a ${Math.floor(diffHours / 24)} jours`;
      }
    };

    const handleDeleteAnimal = async (animalId: string) => {
        Alert.alert(
          'Confirmer la suppression',
          'Voulez-vous vraiment supprimer cet animal ?',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteDoc(doc(db, 'livestock', animalId));
                  // Mettre à jour le state local
                  setLivestockData(prev => ({
                    all: prev.all.filter(a => a.id !== animalId),
                    alerts: prev.alerts.filter(a => a.id !== animalId)
                  }));
                  Alert.alert('Succès', 'Animal supprimé avec succès');
                } catch (error) {
                  console.error("Erreur de suppression:", error);
                  Alert.alert('Erreur', "Échec de la suppression de l'animal");
                }
              },
            },
          ],
          { cancelable: true }
        );
      };
  
    const renderAnimalCard = ({ item }: { item: Animal }) => (
        <View style={styles.animalCardContainer}>

            <TouchableOpacity
                style={styles.animalCard}
                onPress={() => handleEditAnimal(item)}
            >
                {item.photoBase64 ? (
                    <Image source={{ uri: item.photoBase64 }} style={styles.animalImage} />
                ) : (
                    <View style={styles.animalImage}>
                        <Ionicons name="paw" size={40} color="#6c757d" />
                    </View>
                )}
                <View style={styles.animalInfo}>
                    <View style={styles.animalHeader}>
                        <Text style={styles.animalName}>{item.name}</Text>
                        <View style={[
                            styles.healthStatus,
                            item.health === 'healthy' ? styles.healthy :
                                item.health === 'warning' ? styles.warning :
                                    styles.critical
                        ]}>
                            <Ionicons
                                name={
                                    item.health === 'healthy' ? 'checkmark-circle' :
                                        item.health === 'warning' ? 'warning' : 'alert-circle'
                                }
                                size={16}
                                color="white"
                            />
                        </View>
                    </View>
                    <Text style={styles.animalType}>{item.type} • {item.age}</Text>
                    <View style={styles.lastCheckContainer}>
                        <Ionicons name="time-outline" size={14} color="#6c757d" />
                        <Text style={styles.lastCheckText}>{item.lastCheck}</Text>
                    </View>
                </View>
                <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAnimal(item.id)}
            >
                <Ionicons name="trash" size={24} color="#dc3545" />
            </TouchableOpacity>
            </TouchableOpacity>

           
        </View>

    );

    const renderAlertItem = ({ item }: { item: AnimalAlert }) => (
        <View style={[
            styles.alertCard,
            item.level === 'warning' ? styles.warningCard : styles.criticalCard
        ]}>
            <View style={styles.alertHeader}>
                <Text style={styles.alertAnimal}>{item.name}</Text>
                <Text style={styles.alertLevel}>
                    {item.level === 'warning' ? 'A surveiller' : 'Urgent'}
                </Text>
            </View>
            <Text style={styles.alertIssue}>{item.issue}</Text>
            <TouchableOpacity
                style={styles.alertButton}
                onPress={() => router.push(`/livestock`)}
            >
                <Text style={styles.alertButtonText}>Voir détails</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
      return (
        <View>
          <Text>Chargement des données...</Text>
        </View>
      );
    }
  return (
    <View style={styles.container}>
      {/* En-tête */}

       <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#2e8b57" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Surveillance du Bétail</Text>
            <TouchableOpacity onPress={() => setAddModalVisible(true)}>
                <Ionicons name="add" size={28} color="#2e8b57" />
            </TouchableOpacity>
         </View>

         <LivestockAddModal 
        visible={addModalVisible} 
        onClose={() => {
          setAddModalVisible(false);
          setSelectedAnimal(null);
        }}
        animalToEdit={selectedAnimal}
        onSave={handleSaveAnimal}
      />
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tous les animaux
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{livestockData.alerts.length}</Text>
          </View>
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            Alertes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'all' ? (
          <FlatList
            data={livestockData.all}
            renderItem={renderAnimalCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <FlatList
            data={livestockData.alerts}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyAlerts}>
                <Ionicons name="checkmark-done-circle" size={50} color="#2e8b57" />
                <Text style={styles.emptyAlertsText}>Aucune alerte active</Text>
              </View>
            }
          />
        )}

        {/* Statistiques */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques du troupeau</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{livestockData.all.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.healthyStat]}>
                {livestockData.all.filter(a => a.health === 'healthy').length}
              </Text>
              <Text style={styles.statLabel}>En bonne santé</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.warningStat]}>
                {livestockData.all.filter(a => a.health === 'warning').length}
              </Text>
              <Text style={styles.statLabel}>À surveiller</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.criticalStat]}>
                {livestockData.all.filter(a => a.health === 'critical').length}
              </Text>
              <Text style={styles.statLabel}>Urgents</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e8b57',
},
animalCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 10, 
    right: 10,  
    padding: 10, 
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'white',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2e8b57',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#2e8b57',
    fontWeight: '600',
  },
  alertBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  animalCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  animalImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    resizeMode: 'cover',
  },
  animalInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthy: {
    backgroundColor: '#28a745',
  },
  warning: {
    backgroundColor: '#ffc107',
  },
  critical: {
    backgroundColor: '#dc3545',
  },
  animalType: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  lastCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  lastCheckText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 5,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
  },
  criticalCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#dc3545',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  alertAnimal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  alertLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc3545',
  },
  alertIssue: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  alertButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: '#e9ecef',
  },
  alertButtonText: {
    color: '#2e8b57',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyAlerts: {
    alignItems: 'center',
    padding: 30,
  },
  emptyAlertsText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 10,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  healthyStat: {
    color: '#28a745',
  },
  warningStat: {
    color: '#ffc107',
  },
  criticalStat: {
    color: '#dc3545',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});