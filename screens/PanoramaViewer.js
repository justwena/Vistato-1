import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";

const PanoramaViewer = ({ route }) => {
  const { entrance, seaside, endRoute } = route.params || {}; // Get all 360° URLs
  const [currentUrl, setCurrentUrl] = useState(null);

  // Debugging: Check if URLs are received correctly
  useEffect(() => {
    console.log("Received URLs:", { entrance, seaside, endRoute });

    if (entrance || seaside || endRoute) {
      setCurrentUrl(entrance || seaside || endRoute); // Set default URL
    }
  }, [entrance, seaside, endRoute]);

  return (
    <View style={styles.container}>
      {/* Button Container */}
      <View style={styles.buttonWrapper}>
        <ScrollView horizontal contentContainerStyle={styles.buttonContainer}>
          {entrance && (
            <TouchableOpacity style={styles.button} onPress={() => setCurrentUrl(entrance)}>
              <Text style={styles.buttonText}>Entrance</Text>
            </TouchableOpacity>
          )}
          {seaside && (
            <TouchableOpacity style={styles.button} onPress={() => setCurrentUrl(seaside)}>
              <Text style={styles.buttonText}>Seaside</Text>
            </TouchableOpacity>
          )}
          {endRoute && (
            <TouchableOpacity style={styles.button} onPress={() => setCurrentUrl(endRoute)}>
              <Text style={styles.buttonText}>End Route</Text>
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
    fontSize: 18,
    color: "red",
  },
});

export default PanoramaViewer;
