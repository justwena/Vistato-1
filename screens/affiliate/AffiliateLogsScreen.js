import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  VirtualizedList,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import firebase from "../../firebase.js";
import { Ionicons } from "@expo/vector-icons";

const LogsScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error("No authenticated user.");
      setLoading(false);
      return;
    }

    const logsRef = firebase.database().ref(`logs/${user.uid}`);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    logsRef.on("child_added", (snapshot) => {
      clearTimeout(timeout);
      const logData = snapshot.val();
      setLogs((prevLogs) => [{ id: snapshot.key, ...logData }, ...prevLogs]);
      setLoading(false);
    });

    logsRef.once("value", (snapshot) => {
      const logsData = snapshot.val();
      if (logsData) {
        const logsArray = Object.entries(logsData).map(([logId, logData]) => ({
          id: logId,
          ...logData,
        }));
        setLogs(logsArray.reverse());
      }
      setLoading(false);
    });

    return () => {
      logsRef.off();
      clearTimeout(timeout);
    };
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Logs</Text>
        <View style={{ width: 24 }}></View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#088B9C" />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="warning" size={50} color="#FF6347" />
              <Text>No logs available</Text>
            </View>
          ) : (
            <VirtualizedList
              contentContainerStyle={styles.listContent}
              data={logs.reverse()}
              renderItem={({ item }) => (
                <View style={styles.logContainer}>
                  <View style={styles.logContent}>
                    <Text style={styles.logMessage}>{item.message}</Text>
                    <Text style={styles.logTimestamp}>
                      {formatDate(item.timestamp)}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => item.id + index.toString()}
              getItemCount={() => logs.length}
              getItem={(data, index) => data[index]}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: "auto",
    marginRight: "auto",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    padding: 10,
  },
  logContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
  },
  logContent: {
    flex: 1,
    flexDirection: "column",
  },
  logMessage: {
    fontSize: 14,
  },
  logTimestamp: {
    fontSize: 12,
    color: "#888",
  },
});

export default LogsScreen;
