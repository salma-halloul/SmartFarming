import { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Animal, AnimalHealth } from '@/types/animal';

interface LivestockAddModalProps {
    visible: boolean;
    onClose: () => void;
    animalToEdit?: Animal | null; 
    onSave?: (updatedAnimal: Animal) => void; // Callback pour la sauvegarde
}

const healthOptions: { value: AnimalHealth; label: string; icon: "checkmark-circle" | "warning" | "alert-circle"; color: string }[] = [
    { value: 'healthy', label: 'En bonne santé', icon: 'checkmark-circle', color: '#28a745' },
    { value: 'warning', label: 'À surveiller', icon: 'warning', color: '#ffc107' },
    { value: 'critical', label: 'Problème grave', icon: 'alert-circle', color: '#dc3545' },
  ];


  const LivestockAddModal: React.FC<LivestockAddModalProps> = ({ visible, onClose, animalToEdit, onSave }) => {
  const [form, setForm] = useState(animalToEdit || {
    name: '',
    type: 'Vache',
    age: '',
    health: 'healthy',
    photoBase64: ''
  });


  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const animalTypes = ['Vache', 'Taureau', 'Veau', 'Brebis', 'Chèvre'];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Qualité réduite pour limiter la taille
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Qualité réduite pour limiter la taille
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri : any) => {
    try {
      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Garder l'URI pour l'affichage preview
      setImageUri(uri);
      // Stocker le base64 dans le state
      setForm({...form, photoBase64: `data:image/jpeg;base64,${base64}`});
    } catch (error) {
      console.error("Erreur de conversion:", error);
      Alert.alert('Erreur', "Impossible de traiter l'image");
    }
  };

  // Initialiser le form quand animalToEdit change
  useEffect(() => {
    if (animalToEdit) {
      setForm(animalToEdit);
      if (animalToEdit.photoBase64) {
        setImageUri(animalToEdit.photoBase64);
      }
    } else {
      resetForm();
    }
  }, [animalToEdit]);

  const handleSubmit = async () => {
    if (!form.name || !form.age) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      if (animalToEdit) {
        // Mode édition
        await updateDoc(doc(db, 'livestock', animalToEdit.id), {
          ...form,
          lastCheck: new Date()
        });
        onSave?.({ ...form, id: animalToEdit.id } as Animal);
      } else {
        // Mode création
        const newLivestockRef = doc(collection(db, 'livestock'));
        await setDoc(newLivestockRef, {
          ...form,
          createdAt: new Date(),
          lastCheck: new Date()
        });
      }
      
      Alert.alert('Succès', `Animal ${animalToEdit ? 'modifié' : 'ajouté'} avec succès`);
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert('Erreur', `Échec de ${animalToEdit ? 'la modification' : "l'ajout"} de l'animal`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'Vache',
      age: '',
      photoBase64: '',
      health: 'healthy'
    });
    setImageUri(null);
  };

  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* En-tête */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un animal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Photo de l'animal</Text>
          <View style={styles.photoContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={40} color="#6c757d" />
                </View>
              )}
              <View style={styles.photoButtons}>
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image" size={20} color="#2e8b57" />
                  <Text style={styles.photoButtonText}>Galerie</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={20} color="#2e8b57" />
                  <Text style={styles.photoButtonText}>Appareil photo</Text>
                </TouchableOpacity>
              </View>
              {form.photoBase64 && (
                <Text style={styles.sizeInfo}>
                  Taille: {(form.photoBase64.length / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>


            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Bella"
              value={form.name}
              onChangeText={(text) => setForm({...form, name: text})}
            />

<Text style={styles.label}>Âge *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3 ans"
              value={form.age}
              onChangeText={(text) => setForm({...form, age: text})}
              keyboardType="default"
            />

            <Text style={styles.label}>Type *</Text>
            <View style={styles.typeContainer}>
              {animalTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    form.type === type && styles.selectedType
                  ]}
                  onPress={() => setForm({...form, type})}
                >
                  <Text style={[
                    styles.typeText,
                    form.type === type && styles.selectedTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

<Text style={styles.label}>Statut de santé *</Text>
            <View style={styles.healthContainer}>
              {healthOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.healthButton,
                    form.health === option.value && { 
                      backgroundColor: `${option.color}20`,
                      borderColor: option.color
                    }
                  ]}
                  onPress={() => setForm({...form, health: option.value})}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={option.color} 
                    style={styles.healthIcon}
                  />
                  <Text style={[
                    styles.healthButtonText,
                    { color: form.health === option.value ? option.color : '#495057' }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Boutons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Enregistrement...' : 'Ajouter l\'animal'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2e8b57',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 8,
    color: '#343a40',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: '#f8f9fa',
  },
  selectedType: {
    backgroundColor: '#2e8b57',
    borderColor: '#2e8b57',
  },
  typeText: {
    color: '#495057',
  },
  selectedTypeText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontWeight: '500',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2e8b57',
    opacity: 1,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    gap: 5,
  },
  photoButtonText: {
    color: '#2e8b57',
    fontWeight: '500',
  },
  sizeInfo: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 15,
  },
  healthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  healthButton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: '#f8f9fa',
  },
  healthIcon: {
    marginRight: 8,
  },
  healthButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});


export default LivestockAddModal;
