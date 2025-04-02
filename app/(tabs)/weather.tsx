import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WeatherScreen() {
  const router = useRouter();

  // Données météo simulées (à remplacer par une API réelle)
  const currentWeather = {
    temperature: '24°C',
    humidity: '65%',
    wind: '12 km/h',
    precipitation: '10%',
    condition: 'Ensoleillé',
    icon: 'sunny',
  };

  const forecast = [
    { day: 'Lun', temp: '26°C', icon: 'sunny' },
    { day: 'Mar', temp: '22°C', icon: 'partly-sunny' },
    { day: 'Mer', temp: '18°C', icon: 'rainy' },
    { day: 'Jeu', temp: '20°C', icon: 'cloudy' },
    { day: 'Ven', temp: '25°C', icon: 'sunny' },
  ];

  const weatherAlerts = [
    { id: 1, message: 'Aucune alerte météo active', severity: 'info' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2e8b57" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Météo Agricole</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Carte principale (conditions actuelles) */}
      <LinearGradient
        colors={['#4caf50', '#2e8b57']}
        style={styles.currentWeatherCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.weatherHeader}>
          <Ionicons 
            name={currentWeather.icon as any} 
            size={60} 
            color="white" 
          />
          <Text style={styles.currentTemp}>{currentWeather.temperature}</Text>
        </View>
        <Text style={styles.weatherCondition}>{currentWeather.condition}</Text>
        
        <View style={styles.weatherDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={20} color="white" />
            <Text style={styles.detailText}>{currentWeather.humidity}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={20} color="white" />
            <Text style={styles.detailText}>{currentWeather.wind}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="rainy-outline" size={20} color="white" />
            <Text style={styles.detailText}>{currentWeather.precipitation}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Prévisions sur 5 jours */}
      <Text style={styles.sectionTitle}>Prévisions sur 5 jours</Text>
      <View style={styles.forecastContainer}>
        {forecast.map((day, index) => (
          <View key={index} style={styles.forecastDay}>
            <Text style={styles.forecastDayText}>{day.day}</Text>
            <Ionicons 
              name={day.icon as any} 
              size={30} 
              color="#2e8b57" 
            />
            <Text style={styles.forecastTemp}>{day.temp}</Text>
          </View>
        ))}
      </View>

      {/* Alertes météo */}
      <Text style={styles.sectionTitle}>Alertes</Text>
      <View style={styles.alertCard}>
        <Ionicons 
          name="warning-outline" 
          size={24} 
          color={weatherAlerts[0].severity === 'info' ? '#2e8b57' : '#ff5722'} 
        />
        <Text style={styles.alertText}>{weatherAlerts[0].message}</Text>
      </View>

      {/* Conseils agricoles basés sur la météo */}
      <Text style={styles.sectionTitle}>Conseils pour vos cultures</Text>
      <View style={styles.tipsCard}>
        <Text style={styles.tipText}>
          🌱 Conditions idéales pour l'irrigation en fin de journée.
        </Text>
        <Text style={styles.tipText}>
          🌾 Semis recommandés pour le maïs dans les 3 prochains jours.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  currentWeatherCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherCondition: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    color: 'white',
    marginTop: 5,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayText: {
    fontWeight: 'bold',
    color: '#555',
  },
  forecastTemp: {
    marginTop: 5,
    color: '#2e8b57',
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  alertText: {
    marginLeft: 10,
    color: '#555',
    flex: 1,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  tipText: {
    marginBottom: 10,
    color: '#333',
    lineHeight: 22,
  },
});