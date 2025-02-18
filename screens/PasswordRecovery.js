import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import firebase from "../firebase";

const PasswordRecovery = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordRecovery = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setLoading(false);
      Alert.alert("Success", "A password reset link has been sent to your email.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (err) {
      setLoading(false);
      setError("Failed to send password reset email. Please check your email address.");
    }
  };

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")} // Set background image
      style={styles.backgroundImage} // Apply styles to the image
    >
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleNavigateBack}>
          <Image
            source={require("../assets/backlogo.png")}
            style={styles.backButtonImage}
          />
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require("../assets/vista-logo.png")}
          style={styles.logo}
        />

        {/* Title */}
        <Text style={styles.mainText}>Recover your Password</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Error Message */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Button */}
          <TouchableOpacity
            style={styles.recoveryButton}
            onPress={handlePasswordRecovery}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send Recovery Email</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Make sure the image covers the screen
    justifyContent: "center", // Center content vertically
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backButtonImage: {
    width: 60,
    height: 32,
    top: -15,
    left: -15,
    resizeMode: "contain",
  },
  logo: {
    width: 205,
    height: 205,
    resizeMode: "contain",
    marginBottom: 30,
  },
  mainText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4C8C2C",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },
  inputWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Light transparent background for input fields
    borderRadius: 25,
    marginBottom: 15,
    padding: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4C8C2C",
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  error: {
    color: "#fff",
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
  },
  recoveryButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#C5DC7C",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PasswordRecovery;
