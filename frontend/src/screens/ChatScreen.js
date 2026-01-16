import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { chatApi, WS_URL } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ route }) => {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { user } = useContext(AuthContext);
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    setupWebSocket();
    return () => ws?.close();
  }, []);

  const setupWebSocket = () => {
    const socket = new WebSocket(`${WS_URL}/${conversationId}/`);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.sender_id !== user.id) {
        const newMessage = {
          id: data.id,
          text: data.message,
          timestamp: data.timestamp,
          sender: data.sender_id,
          sender_username: data.sender_username,
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };
    setWs(socket);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await chatApi.getMessages(conversationId);
      setMessages(response.data.reverse()); // Keep newest at bottom for FlatList inverted
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === '' || !ws) return;

    const msgData = {
      message: inputText,
      sender_id: user.id,
      conversation_id: conversationId,
    };

    ws.send(JSON.stringify(msgData));
    
    // Optimistic update
    const optimisticMsg = {
      id: Date.now().toString(),
      text: inputText,
      timestamp: new Date().toISOString(),
      sender: user.id,
      sender_username: user.username,
    };
    
    setMessages((prev) => [optimisticMsg, ...prev]);
    setInputText('');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      if (file.fileSize > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      const formData = new FormData();
      formData.append('conversation', conversationId);
      formData.append('media', {
        uri: file.uri,
        name: file.fileName || 'upload.jpg',
        type: 'image/jpeg',
      });

      try {
        await chatApi.sendMessage(formData);
        fetchMessages();
      } catch (error) {
        alert("Failed to upload image");
      }
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === user.id;
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && <Text style={styles.usernameText}>{item.sender_username}</Text>}
        {item.media && (
          <Image source={{ uri: item.media }} style={styles.messageImage} resizeMode="cover" />
        )}
        {item.text && <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>}
        <Text style={styles.timestampText}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        inverted
        contentContainerStyle={styles.listContent}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 10 }} /> : null}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handlePickImage} style={styles.attachButton}>
          <Ionicons name="image-outline" size={24} color="#007bff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color={inputText.trim() ? "#007bff" : "#ccc"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  usernameText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
});

export default ChatScreen;
