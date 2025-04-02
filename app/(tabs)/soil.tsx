import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from "react-native-chart-kit";


export default function SoilScreen() {
  const router = useRouter();

  // Données simulées du sol (à remplacer par des données réelles ou API)
  const soilData = {
    moisture: 0.65,       // 65%
    nutrients: 0.42,      // 42%
    ph: 6.2,             // pH neutre
    temperature: 18,      // °C
    quality: 'Bonne',
    recommendations: [
      '🌱 Ajouter un engrais azoté dans la parcelle nord',
      '💧 Réduire l\'irrigation de 15% cette semaine',
      '🔍 Vérifier le pH dans 2 semaines'
    ]
  };

  // Configuration du graphique circulaire
  const chartData = [
    {
      name: "Humidité",
      population: soilData.moisture * 100, // Convertir en pourcentage
      color: "#2e8b57",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Nutriments",
      population: soilData.nutrients * 100, // Convertir en pourcentage
      color: "#ffa500",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2e8b57" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse du Sol</Text>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="pencil-outline" size={24} color="#2e8b57" />
        </TouchableOpacity>
      </View>

      {/* Carte principale (Statistiques) */}
      <View style={styles.statsCard}>
        <PieChart
          data={chartData}
          width={300}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={24} color="#2e8b57" />
            <Text style={styles.statValue}>{Math.round(soilData.moisture * 100)}%</Text>
            <Text style={styles.statLabel}>Humidité</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="nutrition-outline" size={24} color="#ffa500" />
            <Text style={styles.statValue}>{Math.round(soilData.nutrients * 100)}%</Text>
            <Text style={styles.statLabel}>Nutriments</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="flask-outline" size={24} color="#6a5acd" />
            <Text style={styles.statValue}>{soilData.ph}</Text>
            <Text style={styles.statLabel}>pH</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="thermometer-outline" size={24} color="#ff4500" />
            <Text style={styles.statValue}>{soilData.temperature}°C</Text>
            <Text style={styles.statLabel}>Température</Text>
          </View>
        </View>
      </View>

      {/* Évaluation globale */}
      <View style={styles.qualityCard}>
        <Text style={styles.qualityText}>Qualité du sol: </Text>
        <Text style={[styles.qualityValue, 
          soilData.quality === 'Bonne' ? styles.goodQuality : styles.badQuality
        ]}>
          {soilData.quality}
        </Text>
        <Ionicons 
          name={soilData.quality === 'Bonne' ? "checkmark-circle" : "warning"} 
          size={24} 
          color={soilData.quality === 'Bonne' ? "#2e8b57" : "#ff4500"} 
        />
      </View>

      {/* Recommandations */}
      <Text style={styles.sectionTitle}>Recommandations</Text>
      <View style={styles.recommandationCard}>
        {soilData.recommendations.map((item, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Historique */}
      <Text style={styles.sectionTitle}>Historique (7 jours)</Text>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyHeaderText}>Date</Text>
          <Text style={styles.historyHeaderText}>pH</Text>
          <Text style={styles.historyHeaderText}>Humidité</Text>
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.historyRow}>
            <Text style={styles.historyCell}>2023-11-{10 + item}</Text>
            <Text style={styles.historyCell}>{6.0 + item * 0.1}</Text>
            <Text style={styles.historyCell}>{60 + item * 2}%</Text>
          </View>
        ))}
      </View>

      {/* Bouton d'analyse */}
      <TouchableOpacity style={styles.analyzeButton}>
        <Text style={styles.analyzeButtonText}>Lancer une nouvelle analyse</Text>
      </TouchableOpacity>
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
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10, // Adjust spacing between the chart and the legend
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
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
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 5,
  },
  qualityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  goodQuality: {
    color: '#2e8b57',
  },
  badQuality: {
    color: '#ff4500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },
  recommandationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationText: {
    marginLeft: 10,
    color: '#333',
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  historyHeaderText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  historyCell: {
    flex: 1,
    textAlign: 'center',
    color: '#555',
  },
  analyzeButton: {
    backgroundColor: '#2e8b57',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});