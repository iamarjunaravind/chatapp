import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { chatApi } from '../api/client';
import { theme } from '../theme/colors';

const UserSearchScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await chatApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = async (participantId, username) => {
    try {
      const response = await chatApi.createConversation(participantId);
      navigation.replace('Chat', { conversationId: response.data.id, title: username });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => startConversation(item.id, item.username)}
    >
      <LinearGradient colors={theme.cardBg} style={styles.card}>
        <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.username}&background=d6a354&color=000` }} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.actionText}>Message</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search astrologers..."
        placeholderTextColor={theme.muted}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { 
    padding: 15, margin: 20, 
    backgroundColor: theme.inputBg, 
    borderRadius: 12, 
    color: theme.text,
    borderWidth: 1, borderColor: theme.border
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: theme.border
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  username: { fontSize: 16, color: theme.text, flex: 1 },
  actionText: { color: theme.gold, fontWeight: '600' },
});

export default UserSearchScreen;
