import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // Import icons

const WeatherModal = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API_KEY = "c2bf65bde1944a54977140057252202"; 
  const BASE_URL = "http://api.weatherapi.com/v1/current.json";

  // Fixed Coordinates for Pinamalayan, Oriental Mindoro
  const LATITUDE = 13.0691;
  const LONGITUDE = 121.5185;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}?key=${API_KEY}&q=${LATITUDE},${LONGITUDE}`
        );

        setWeather(response.data);
      } catch (err) {
        setError("Could not fetch weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
      {/* Button to Open Modal with Icon */}
      <TouchableOpacity style={styles.weatherButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="partly-sunny" size={28} color="white" />
      </TouchableOpacity>

      {/* Weather Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="gray" />
            ) : error ? (
              <Text style={styles.error}>{error}</Text>
            ) : (
              <>
                <Text style={styles.city}>{weather.location.name}, {weather.location.country}</Text>
                <Image 
                  source={{ uri: `https:${weather.current.condition.icon}` }} 
                  style={styles.icon} 
                />
                <Text style={styles.temp}>{weather.current.temp_c}°C</Text>
                <Text style={styles.desc}>{weather.current.condition.text}</Text>
                <Text style={styles.extra}>Humidity: {weather.current.humidity}%</Text>
                <Text style={styles.extra}>Wind: {weather.current.wind_kph} kph</Text>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", left: 120},

  // Weather Button (with icon)
  weatherButton: { 
    backgroundColor: "#007AFF", 
    padding: 12, 
    borderRadius: 50, 
    alignItems: "center", 
    justifyContent: "center",
    width: 50, 
    height: 50,
  },

  // Modal Styles
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { 
    backgroundColor: "white", 
    padding: 25, 
    borderRadius: 12, 
    alignItems: "center", 
    width: 300,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },

  city: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  temp: { fontSize: 40, fontWeight: "bold", marginVertical: 10 },
  desc: { fontSize: 18, textTransform: "capitalize", marginBottom: 10 },
  extra: { fontSize: 16, color: "gray", marginBottom: 5 },
  icon: { width: 64, height: 64, marginBottom: 10 },

  // Close Button
  closeButton: { backgroundColor: "#ff3b30", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  error: { color: "red", fontSize: 14, marginBottom: 10 },
});

export default WeatherModal;
