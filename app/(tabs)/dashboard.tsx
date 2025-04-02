import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const router = useRouter();

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

  const livestockData = [
    { id: 1, name: 'Vache #101', status: '✅ En bonne santé' },
    { id: 2, name: 'Vache #102', status: '⚠️ À surveiller' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <TouchableOpacity onPress={() => router.push('/')}>
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
          <Text style={styles.cardTitle}>Bétail</Text>
        </View>
        {livestockData.map((animal) => (
          <View key={animal.id} style={styles.livestockItem}>
            <Text style={styles.livestockName}>{animal.name}</Text>
            <Text style={[
              styles.livestockStatus,
              animal.status.includes('⚠️') ? styles.warning : styles.success
            ]}>
              {animal.status}
            </Text>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.addButtonText}>+ Ajouter un animal</Text>
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
  livestockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  livestockName: {
    fontSize: 16,
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
});