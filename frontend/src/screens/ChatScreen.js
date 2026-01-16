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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { chatApi, WS_URL } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

const ChatScreen = ({ route }) => {
  const { conversationId, title } = route.params; // Added title for header if needed
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
      setMessages(response.data.reverse()); 
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
        <Text style={[styles.timestampText, isMe ? { color: 'rgba(0,0,0,0.6)' } : { color: theme.muted }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          inverted
          contentContainerStyle={styles.listContent}
          ListFooterComponent={loading ? <ActivityIndicator color={theme.gold} style={{ margin: 10 }} /> : null}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handlePickImage} style={styles.attachButton}>
            <Ionicons name="image-outline" size={24} color={theme.gold} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.muted}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color={inputText.trim() ? theme.gold : theme.muted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.gold,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b2715', // Dark brown from card gradient
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#3a2b1a',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#0b0a0a', // Dark text on Gold
    fontWeight: '500',
  },
  theirMessageText: {
    color: theme.text, // White text on Dark
  },
  usernameText: {
    fontSize: 12,
    color: theme.gold,
    marginBottom: 4,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
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
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12, // Extra padding for iOS home indicator
    alignItems: 'center',
    backgroundColor: '#1a120c', // Card Dark
    borderTopWidth: 1,
    borderTopColor: '#3a2b1a',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0b0a0a', // Deep Black Input
    borderRadius: 24,
    maxHeight: 100,
    color: theme.text, // White text
    borderWidth: 1,
    borderColor: '#3a2b1a',
  },
  sendButton: {
    padding: 8,
  },
});

export default ChatScreen;
