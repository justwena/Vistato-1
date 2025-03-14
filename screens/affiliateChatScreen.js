import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import firebase from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={'white'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

const AffiliateChatScreen = ({ route }) => {
  const { currentId, chatPartnerId } = route.params; // Get current user ID and other user ID
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatPartnerName, setChatPartnerName] = useState("");
  const flatListRef = useRef(null);

  // Fetch chat partner's name from the customers collection
  useEffect(() => {
    const fetchChatPartnerName = async () => {
      const userSnapshot = await firebase.database().ref(`customers/${chatPartnerId}`).once("value");
      const userData = userSnapshot.val();
      if (userData) {
        setChatPartnerName(userData.username);
      }
    };

    fetchChatPartnerName();
  }, [chatPartnerId]);

  // Debugging: Log the currentId and chatPartnerId
  useEffect(() => {
    console.log("currentId:", currentId);
    console.log("chatPartnerId:", chatPartnerId);
  }, [currentId, chatPartnerId]);

  // Generate a unique chat room ID based on user IDs
  const chatRoomId = currentId && chatPartnerId ? (currentId < chatPartnerId ? `${currentId}_${chatPartnerId}` : `${chatPartnerId}_${currentId}`) : null;

  useEffect(() => {
    if (!currentId || !chatPartnerId) {
      console.error("Error: currentId or chatPartnerId is undefined");
      return;
    }

    if (!chatRoomId) {
      console.error("Error: chatRoomId is undefined");
      return;
    }

    console.log("Fetching messages for chatRoomId:", chatRoomId); // Debugging Log

    const chatRef = firebase.database().ref(`chats/${chatRoomId}`);
    chatRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("Chat data:", data); // Debugging Log

      if (data) {
        const sortedMessages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);
      } else {
        setMessages([]); // Ensure it doesn't crash if no messages exist
      }
    });

    return () => chatRef.off();
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (message.trim()) {
      const chatRef = firebase.database().ref(`chats/${chatRoomId}`);
      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        console.error("No user is logged in.");
        return;
      }

      const newMessage = {
        text: message,
        timestamp: Date.now(),
        sender: currentUser.uid, // Set sender ID
      };

      console.log("Sending message:", newMessage); // Debugging Log

      await chatRef.push(newMessage);
      setMessage("");
    }
  };

  const renderItem = ({ item }) => {
    const currentUser = firebase.auth().currentUser;
    const isCurrentUser = item.sender === currentUser?.uid;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.sentMessage : styles.receivedMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <CustomHeader title={chatPartnerName} />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput value={message} onChangeText={setMessage} placeholder="Type a message..." style={styles.input} />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  safeArea: {
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  sentMessage: {
    backgroundColor: "#bb3e03",
    alignSelf: "flex-end",
    borderRadius: 20,
    padding: 10,
    margin: 5,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  receivedMessage: {
    backgroundColor: "#006d77",
    borderRadius: 20,
    padding: 10,
    margin: 5,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    color: "white",
  },
  timestamp: {
    fontSize: 10,
    color: "#ddd",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0084FF",
    padding: 10,
    borderRadius: 50,
  },
});

export default AffiliateChatScreen;