import React, { useState, useContext } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      await login(response.data.user, { access: response.data.access, refresh: response.data.refresh });
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <Text style={styles.title}>AstroApp</Text>
      <Text style={styles.subtitle}>Login to consult</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={theme.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={theme.muted}
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Start Consultation</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>New here? <Text style={{color: theme.gold}}>Create Account</Text></Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, color: theme.gold, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: theme.muted, textAlign: 'center', marginBottom: 40 },
  inputContainer: { gap: 15, marginBottom: 30 },
  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 15,
    borderRadius: 12,
    color: theme.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.gold,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  error: { color: theme.error, marginBottom: 15, textAlign: 'center' },
  link: { color: theme.muted, marginTop: 10, textAlign: 'center', fontSize: 14 },
});

export default LoginScreen;
