import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

interface ProgramModalProps {
  visible: boolean;
  onClose: () => void;
  onProgramAdded: () => void; // Callback pour le rechargement
}


const ProgramModal: React.FC<ProgramModalProps> = ({ visible, onClose, onProgramAdded }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState('30');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [waterAmount, setWaterAmount] = useState('5');
  const [zones, setZones] = useState<Zone[]>([]);
  

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

  useEffect(() => {
    if (visible) {
      loadZones();
    }
  }, [visible]);

  const handleSchedule = async () => {
    if (!selectedZone) return;
    
    const zone = zones.find(z => z.id === selectedZone);
    
    try {
      await addDoc(collection(db, 'programmes'), {
        date: date.toLocaleString(),
        duration: Number(duration),
        selectedZone: zone?.name || 'Zone inconnue',
        waterAmount: Number(waterAmount),
        timestamp: new Date(),
      });
      
      Alert.alert('Succès', 'Programme ajouté avec succès');
      onProgramAdded(); // Notifie le parent de recharger les données
      onClose(); // Ferme le modal
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le programme');
    }
  };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <LinearGradient
                    colors={['#f8f9fa', '#e9ecef']}
                    style={styles.modalContent}
                >
                    {/* En-tête */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Programmer Irrigation</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6c757d" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Sélection de la zone */}
                        <Text style={styles.sectionTitle}>Zone à irriguer</Text>
                        <View style={styles.zonesContainer}>
                            {zones.length > 0 ? (
                                zones.map(zone => (
                                    <TouchableOpacity
                                        key={zone.id}
                                        style={[
                                            styles.zoneButton,
                                            selectedZone === zone.id && styles.selectedZone
                                        ]}
                                        onPress={() => setSelectedZone(zone.id)}
                                    >
                                        <Text style={[
                                            styles.zoneButtonText,
                                            selectedZone === zone.id && styles.selectedZoneText
                                        ]}>
                                            {zone.name}
                                        </Text>

                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text>Aucune zone disponible</Text>
                            )}
                        </View>
                        {/* Date et heure */}
                        <Text style={styles.sectionTitle}>Date et heure</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color="#2e8b57" />
                            <Text style={styles.dateText}>
                                {date.toLocaleString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="datetime"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                                minimumDate={new Date()}
                                locale="fr_FR"
                            />
                        )}

                        {/* Durée */}
                        <Text style={styles.sectionTitle}>Durée (minutes)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                            placeholder="30"
                        />

                        {/* Quantité d'eau */}
                        <Text style={styles.sectionTitle}>Quantité d'eau (L)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={waterAmount}
                            onChangeText={setWaterAmount}
                            placeholder="5"
                        />

                        {/* Boutons d'action */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleSchedule}
                                disabled={!selectedZone}
                            >
                                <Text style={styles.confirmButtonText}>Programmer</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingTop: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2e8b57',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        color: '#495057',
    },
    zonesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 10,
    },
    zoneButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    selectedZone: {
        backgroundColor: '#2e8b57',
        borderColor: '#2e8b57',
    },
    zoneButtonText: {
        color: '#495057',
    },
    selectedZoneText: {
        color: 'white',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    dateText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#495057',
    },
    input: {
        padding: 15,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ced4da',
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 15,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    cancelButtonText: {
        color: '#dc3545',
        fontWeight: '500',
    },
    confirmButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#2e8b57',
        opacity: 1,
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});

export default ProgramModal;