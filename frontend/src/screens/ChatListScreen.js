import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { chatApi } from '../api/client';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      setConversations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }) => {
    const otherParticipant = item.participants[0]; // Simplified: logic needed for more than 2 participants
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: otherParticipant.username })}
      >
        <Text style={styles.username}>{otherParticipant.username}</Text>
        <Text style={styles.lastMessage}>{item.last_message?.text || 'No messages yet'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  username: { fontSize: 18, fontWeight: 'bold' },
  lastMessage: { color: '#666' },
  fab: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center',
    right: 20, bottom: 20, elevation: 5
  },
  fabText: { color: 'white', fontSize: 30 }
});

export default ChatListScreen;
