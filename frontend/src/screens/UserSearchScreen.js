import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { chatApi } from '../api/client';

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
      style={styles.item}
      onPress={() => startConversation(item.id, item.username)}
    >
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { padding: 10, margin: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  username: { fontSize: 18 },
});

export default UserSearchScreen;
