import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import ProgramModal from '../components/ProgramModal';
import { LinearGradient } from 'expo-linear-gradient';


export default function IrrigationScreen() {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<Program[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [nextProgram, setNextProgram] = useState<Program | null>(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneMoisture, setNewZoneMoisture] = useState("");
  const [showAddZone, setShowAddZone] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  
  const loadZones = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'zones'));
      const loadedZones = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        moisture: doc.data().moisture || 0
      }));
      setZones(loadedZones);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
    }
  };

  // Ajouter une nouvelle zone à Firebase
  const addNewZone = async () => {
    if (newZoneName.trim() === "" || newZoneMoisture.trim() === "") return;
    
    const moistureValue = parseInt(newZoneMoisture) || 0;
    
    try {
      await addDoc(collection(db, 'zones'), {
        name: newZoneName,
        moisture: moistureValue
      });
      
      setNewZoneName("");
      setNewZoneMoisture("");
      setShowAddZone(false);
      loadZones(); // Recharger les zones après ajout
    } catch (error) {
      console.error("Erreur lors de l'ajout de la zone:", error);
    }
  };

  const loadPrograms = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'programmes'));
      const loadedPrograms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date || '',
        duration: doc.data().duration || 0,
        selectedZone: doc.data().selectedZone || '',
        waterAmount: doc.data().waterAmount || 0,
        timestamp: doc.data().timestamp?.toDate() || new Date(), // Ajout d'un timestamp
      }));
      
      setProgrammes(loadedPrograms);
      
      // Trouver le programme le plus proche
      if (loadedPrograms.length > 0) {
        const now = new Date();
        const upcomingPrograms = loadedPrograms
          .filter(prog => new Date(prog.timestamp).getTime() > now.getTime()) // Use .getTime() for comparison
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Use .getTime() for subtraction
      
        setNextProgram(upcomingPrograms[0] || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des programmes :', error);
    }
  };

  // Fonction pour formater la date/heure
  const formatProgramTime = (date : any) => {
    if (!date) return "Aucun programme";
    
    const now = new Date();
    const programDate = new Date(date);
    const diffDays = Math.floor((programDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Aujourd'hui à ${programDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (diffDays === 1) {
      return `Demain à ${programDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      return programDate.toLocaleDateString([], { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Modifier une zone existante
  const updateZone = async () => {
    if (!editingZone || editingZone.name.trim() === "" || isNaN(editingZone.moisture)) return;
    
    try {
      await updateDoc(doc(db, 'zones', editingZone.id), {
        name: editingZone.name,
        moisture: editingZone.moisture
      });
      
      setEditingZone(null);
      loadZones();
    } catch (error) {
      console.error("Erreur lors de la modification de la zone:", error);
    }
  };

  // Supprimer une zone
  const deleteZone = async (zoneId: string) => {
    try {
      await deleteDoc(doc(db, 'zones', zoneId));
      loadZones();
    } catch (error) {
      console.error("Erreur lors de la suppression de la zone:", error);
    }
  };
 
  useEffect(() => {
    loadPrograms();
    loadZones();
  }, []);

    return (
        <ScrollView style={styles.mainContainer} contentContainerStyle={styles.scrollContent}>

            {/* En-tête */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#2e8b57" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gestion d'Irrigation</Text>
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Ionicons name="settings-outline" size={24} color="#2e8b57" />
                </TouchableOpacity>
            </View>

            <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.modeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.modeTextContainer}>
                    <Ionicons name="hardware-chip" size={20} color="#2e8b57" />
                    <Text style={styles.modeText}>Mode Automatique</Text>
                </View>
                <Switch
                    value={isAutoMode}
                    onValueChange={setIsAutoMode}
                    thumbColor="#fff"
                    trackColor={{ false: '#767577', true: '#2e8b57' }}
                />
            </LinearGradient>

            <View>
                {/* Statistiques principales */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="water" size={30} color="#2e8b57" />
                        <Text style={styles.statValue}>3.5L</Text>
                        <Text style={styles.statLabel}>Consommation/jour</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time" size={30} color="#2e8b57" />
                        <Text style={styles.statValue}>12min</Text>
                        <Text style={styles.statLabel}>Durée moyenne</Text>
                    </View>
                </View>


                {/* Zones d'irrigation */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Zones d'Irrigation</Text>
                    <TouchableOpacity onPress={() => {
                        setEditingZone(null);
                        setShowAddZone(!showAddZone);
                    }}>
                        <Ionicons name={showAddZone ? "close" : "add"} size={24} color="#2e8b57" />
                    </TouchableOpacity>
                </View>

                {(showAddZone || editingZone) && (
                    <View style={styles.addZoneContainer}>
                        <TextInput
                            style={styles.zoneInput}
                            placeholder="Nom Zone"
                            placeholderTextColor="#999"
                            value={editingZone ? editingZone.name : newZoneName}
                            onChangeText={(text) =>
                                editingZone
                                    ? setEditingZone({ ...editingZone, name: text })
                                    : setNewZoneName(text)
                            }
                        />
                        <TextInput
                            style={styles.zoneInput}
                            placeholder="Humidité (%)"
                            placeholderTextColor="#999"
                            value={
                                editingZone
                                    ? editingZone.moisture.toString()
                                    : newZoneMoisture
                            }
                            onChangeText={(text) =>
                                editingZone
                                    ? setEditingZone({ ...editingZone, moisture: parseInt(text) || 0 })
                                    : setNewZoneMoisture(text)
                            }
                            keyboardType="numeric"
                        />

                        <View style={styles.formButtonsContainer}>
                            {editingZone && (
                                <TouchableOpacity
                                    style={[styles.formButton, styles.cancelButton]}
                                    onPress={() => setEditingZone(null)}
                                >
                                    <Text style={styles.formButtonText}>Annuler</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.formButton,
                                    styles.confirmButton,
                                    ((editingZone
                                        ? editingZone.name.trim() === "" || isNaN(editingZone.moisture)
                                        : newZoneName.trim() === "" || newZoneMoisture.trim() === "")
                                    ) && styles.disabledButton
                                ]}
                                onPress={editingZone ? updateZone : addNewZone}
                                disabled={
                                    editingZone
                                        ? editingZone.name.trim() === "" || isNaN(editingZone.moisture)
                                        : newZoneName.trim() === "" || newZoneMoisture.trim() === ""
                                }
                            >
                                <Text style={styles.formButtonText}>
                                    {editingZone ? "Modifier" : "Ajouter"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

<View style={styles.zoneContainer}>
{zones.map(zone => (
                    <TouchableOpacity
                        key={zone.id}
                        style={styles.zoneCard}
                        onPress={() => {
                            setEditingZone(zone);
                            setShowAddZone(true);
                        }}
                    >
                        <View style={styles.zoneInfo}>
                            <Text style={styles.zoneName}>{zone.name}</Text>
                            <View style={styles.moistureContainer}>
                                <Ionicons name="water-outline" size={16} color="#4682b4" />
                                <Text style={styles.moistureText}>{zone.moisture}%</Text>
                            </View>
                        </View>
                        <View style={styles.zoneActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingZone(zone);
                                    setShowAddZone(true);
                                }}
                            >
                                <Ionicons name="create-outline" size={20} color="#2e8b57" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteZone(zone.id)}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                </View>


                {/* Programmes */}
                <Text style={styles.sectionTitle}>Programmes</Text>
                {programmes.length > 0 ? (
                    <View style={styles.programsContainer}>
                        {/* En-tête du tableau */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerText}>Date</Text>
                            <Text style={styles.headerText}>Durée</Text>
                            <Text style={styles.headerText}>Zone</Text>
                            <Text style={styles.headerText}>Eau (L)</Text>
                        </View>

                        {/* Lignes du tableau */}
                        {programmes.map((program, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.cellText}>{program.date}</Text>
                                <Text style={styles.cellText}>{program.duration} min</Text>
                                <Text style={styles.cellText}>{program.selectedZone}</Text>
                                <Text style={styles.cellText}>{program.waterAmount}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noProgramsText}>Aucun programme disponible.</Text>
                )}


                {/* Programmation */}
                <Text style={styles.sectionTitle}>Programmation</Text>
                <View style={styles.scheduleCard}>
                    <Ionicons name="calendar" size={24} color="#2e8b57" />
                    <View style={styles.scheduleTextContainer}>
                        <Text style={styles.scheduleTitle}>Prochaine irrigation</Text>
                        <Text style={styles.scheduleTime}>Demain 06:00</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Modifier</Text>
                    </TouchableOpacity>
                </View>
            </View>


            <View style={styles.buttonContainer}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.actionButtonText}>Programmer l'irrigation</Text>
                    </TouchableOpacity>

                    <ProgramModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        onProgramAdded={loadPrograms}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 100,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        paddingHorizontal: 15,
    },
    actionButton: {
        backgroundColor: '#2e8b57',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
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
    modeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modeText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 5,
        color: '#2e8b57',
    },
    statLabel: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#343a40',
    },
    zoneCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    moistureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moistureText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#4682b4',
    },
    scheduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    scheduleTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    scheduleTitle: {
        fontSize: 16,
        color: '#6c757d',
    },
    scheduleTime: {
        fontSize: 18,
        fontWeight: '500',
        color: '#2e8b57',
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        backgroundColor: '#e9ecef',
    },
    editButtonText: {
        color: '#2e8b57',
        fontWeight: '500',
    },

    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },

    programCard: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#e9ecef',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    programText: {
        fontSize: 16,
        color: '#495057',
    },
    noProgramsText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 10,
    },
    programsContainer: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    zoneContainer: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2e8b57',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    headerText: {
        flex: 1,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cellText: {
        flex: 1,
        textAlign: 'center',
        color: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addZoneContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    zoneInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
        color: '#000',
        backgroundColor: '#fff',
    },
    addZoneButton: {
        backgroundColor: '#2e8b57',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        opacity: 1,
    },
    addZoneButtonDisabled: {
        opacity: 0.5,
    },
    addZoneButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    disabledButton: {
        opacity: 0.5,
    },

    zoneFormContainer: {
        marginBottom: 15,
    },
    formButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    formButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#2e8b57',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    formButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    zoneCardContainer: {
        marginBottom: 10,
    },

    zoneActions: {
        flexDirection: 'row',
        gap: 15,
    },
    deleteButton: {
        marginLeft: 10,
    },
});


