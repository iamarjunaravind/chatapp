import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${user.username}&background=d6a354&color=000` }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.email}>{user.email || 'No email provided'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color={theme.text} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.menuText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: theme.gold,
    padding: 3, marginBottom: 15,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.gold, marginBottom: 5 },
  email: { fontSize: 16, color: theme.muted },
  menu: {
    backgroundColor: theme.cardBg,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1, borderColor: 'rgba(214,163,84,0.1)',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuText: { flex: 1, fontSize: 16, color: theme.text, marginLeft: 15 },
});

export default ProfileScreen;
