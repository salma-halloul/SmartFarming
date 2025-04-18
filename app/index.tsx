import { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/dashboard');
    } catch (error: any) {
      let errorMessage = "Échec de la connexion";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Email invalide";
          break;
        case 'auth/user-not-found':
          errorMessage = "Utilisateur non trouvé";
          break;
        case 'auth/wrong-password':
          errorMessage = "Mot de passe incorrect";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Trop de tentatives. Réessayez plus tard";
          break;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/image.png')}
        style={styles.image}
      />
      <Text style={styles.title}>Smart Farming</Text>
      <Text style={styles.subtitle}>Connectez-vous</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2e8b57" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '30%', marginBottom:30 }, 

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e8b57',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2e8b57',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#2e8b57',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});