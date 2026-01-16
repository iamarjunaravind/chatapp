import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { chatApi } from '../api/client';
import { theme } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginRight: 15 }}>
          <Ionicons name="person-circle-outline" size={30} color={theme.text} /> 
          {/* Note: Header default color might be dark, we might need to adjust header style globally or locally */}
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: '#d6a354' }, // Gold header
      headerTintColor: '#000',
    });
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      setConversations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }) => {
    const other = item.participants[0]; 
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: other.username })}
      >
        <LinearGradient colors={theme.cardBg} style={styles.card}>
          <View style={styles.avatarContainer}>
             <Image source={{ uri: `https://ui-avatars.com/api/?name=${other.username}&background=d6a354&color=000` }} style={styles.avatar} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.username}>{other.username}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message?.text || 'Start chatting...'}</Text>
          </View>
          <View style={styles.action}>
            <Text style={styles.chatBtn}>Chat</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ItemSeparatorComponent={() => <View style={{height: 15}} />}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Users')}
      >
        <Ionicons name="search" size={28} color="#000" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214,163,84,0.1)',
  },
  avatarContainer: {
    width: 50, height: 50, borderRadius: 25,
    padding: 2,
    borderWidth: 1, borderColor: theme.gold,
    marginRight: 15,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  cardContent: { flex: 1 },
  username: { fontSize: 18, color: theme.text, fontWeight: '600', marginBottom: 4 },
  lastMessage: { color: theme.muted, fontSize: 13 },
  action: {
    backgroundColor: theme.gold,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatBtn: { color: '#000', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: theme.gold, justifyContent: 'center', alignItems: 'center',
    right: 25, bottom: 30, elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10,
  }
});

export default ChatListScreen;
