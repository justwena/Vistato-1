import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import firebase from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { affiliate } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);

  const currentUser = firebase.auth().currentUser;
  const currentId = currentUser ? currentUser.uid : null;
  const chatPartnerId = affiliate.affiliateId;

  useEffect(() => {
    console.log("currentId:", currentId);
    console.log("chatPartnerId:", chatPartnerId);
  }, [currentId, chatPartnerId]);

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

    console.log("Fetching messages for chatRoomId:", chatRoomId);

    const chatRef = firebase.database().ref(`chats/${chatRoomId}`);
    chatRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedMessages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);
      }
    });

    return () => chatRef.off();
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (message.trim()) {
      const chatRef = firebase.database().ref(`chats/${chatRoomId}`);
      if (!currentUser) {
        console.error("No user is logged in.");
        return;
      }

      const newMessage = {
        text: message,
        timestamp: Date.now(),
        sender: currentUser.uid,
      };

      await chatRef.push(newMessage);
      setMessage("");
    }
  };

  const renderItem = ({ item }) => {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{affiliate.username}</Text>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#007bff",
  },
  headerTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
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
    shadowOffset: { width: 0, height: 2 },
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
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    color: "#aaa",
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
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 50,
  },
});

export default ChatScreen;