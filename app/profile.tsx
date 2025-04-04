import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { sendEmailVerification, updateEmail, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser?.email) {
      setNewEmail(auth.currentUser.email);
    }
  }, []);


  const handleUpdateEmail = async () => {
    if (!newEmail || !auth.currentUser) return;
  
    setLoading(true);
    try {
      // Update the email
      await updateEmail(auth.currentUser, newEmail);
  
      // Send a verification email
      await sendEmailVerification(auth.currentUser);
  
      Alert.alert(
        'Succès',
        'Email mis à jour avec succès. Veuillez vérifier votre nouvelle adresse email.'
      );
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Échec de la mise à jour de l'email";
  
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Veuillez vous reconnecter pour modifier votre email";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Veuillez vérifier votre nouvelle adresse email avant de continuer";
      }
  
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la déconnexion');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity disabled={loading}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {auth.currentUser?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={handleUpdateEmail}
          disabled={loading || newEmail === auth.currentUser?.email}
        >
          <Text style={styles.buttonText}>Mettre à jour l'email</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2e8b57" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2e8b57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  changePhotoText: {
    color: '#2e8b57',
    textDecorationLine: 'underline',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  updateButton: {
    backgroundColor: '#2e8b57',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});