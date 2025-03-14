import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, SafeAreaView, StatusBar } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from '@expo/vector-icons';
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

const PanoramaViewer = ({ route }) => {
  const { link } = route.params || {}; // Get the 360° URL
  const [currentUrl, setCurrentUrl] = useState(null);

  // Debugging: Check if URL is received correctly
  useEffect(() => {
    console.log("Received URL:", link);

    if (link) {
      setCurrentUrl(link); // Set default URL
    }
  }, [link]);

  return (
    <View style={styles.container}>
      <CustomHeader title="Panorama Viewer" />
      
      {/* Button Container */}
      <View style={styles.buttonWrapper}>
        <ScrollView horizontal contentContainerStyle={styles.buttonContainer}>
          {link && (
            <TouchableOpacity style={styles.button} onPress={() => setCurrentUrl(link)}>
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* WebView Container */}
      <View style={styles.webViewWrapper}>
        {currentUrl ? (
          <WebView 
            source={{ uri: currentUrl }}
            style={styles.viewer}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onError={(error) => console.error("WebView error:", error)}
          />
        ) : (
          <Text style={styles.errorText}>No 360° view available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  // Custom header styling
  safeArea: {
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    color: 'black',
    fontSize: 16,

  },

  // Button section styling
  buttonWrapper: {
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // WebView section styling
  webViewWrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewer: { flex: 1, width: "100%", height: "100%" },
  
  // Error message styling
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "red",
  },
});

export default PanoramaViewer;