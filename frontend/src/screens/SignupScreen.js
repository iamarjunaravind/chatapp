import React, { useState, useContext } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/colors';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const response = await authApi.signup({ username, email, password });
      await login(response.data.user, { access: response.data.access, refresh: response.data.refresh });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.bg} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/heta-logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.subtitle}>Connect with experts</Text>
        
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
            placeholder="Email"
            placeholderTextColor={theme.muted}
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
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

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={{color: theme.gold}}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 220, height: 80 },
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

export default SignupScreen;
