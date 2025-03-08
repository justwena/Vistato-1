import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import firebase from "../firebase";

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [chatUsers, setChatUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const chatRef = firebase.database().ref(`chats/${currentUserId}`);

    chatRef.on("value", async (snapshot) => {
      const data = snapshot.val();
      const uniqueUserIds = new Set();

      if (data) {
        Object.values(data).forEach((message) => {
          if (message.sender !== currentUserId) {
            uniqueUserIds.add(message.sender);
          }
        });
      }

      const userIdsArray = [...uniqueUserIds];

      // Fetch usernames from customers collection
      const userPromises = userIdsArray.map(async (userId) => {
        const userSnapshot = await firebase.database().ref(`customers/${userId}`).once("value");
        const userData = userSnapshot.val();
        return userData ? { id: userId, username: userData.username } : null;
      });

      const userList = (await Promise.all(userPromises)).filter(Boolean);
      setChatUsers(userList);
      setLoading(false);
    });

    return () => chatRef.off();
  }, [currentUserId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0084FF" style={styles.loader} />
      ) : chatUsers.length === 0 ? (
        <Text style={styles.noChats}>No chats available</Text>
      ) : (
        <FlatList
          data={chatUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.chatItem}
              android_ripple={{ color: "#ddd" }}
              onPress={() => navigation.navigate("AffiliateChatScreen", {
                currentId: currentUserId,
                chatPartnerId: item.id, // Send UID for chat functionality
              })}
            >
              <View style={styles.avatar}>
                <Ionicons name="person-circle" size={40} color="#0084FF" />
              </View>
              <Text style={styles.chatText}>{item.username}</Text>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9F9F9", 
    padding: 16 
  },
  header: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#333" 
  },
  loader: { 
    marginTop: 20 
  },
  noChats: { 
    fontSize: 16, 
    color: "#999", 
    textAlign: "center", 
    marginTop: 20 
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // For Android shadow
  },
  avatar: {
    marginRight: 10,
  },
  chatText: { 
    fontSize: 18, 
    flex: 1, 
    fontWeight: "500", 
    color: "#333" 
  },
});

export default ChatListScreen;
