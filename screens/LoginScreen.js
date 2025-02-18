import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../firebase.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedPassword = await AsyncStorage.getItem("password");
        const rememberMeStatus = await AsyncStorage.getItem("rememberMe");

        if (rememberMeStatus === "true") {
          setEmail(savedEmail || "");
          setPassword(savedPassword || "");
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Failed to load credentials", error);
      }
    };

    loadCredentials();
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setLoading(true);
          const userId = user.uid;

          // Sequential role checks
          const adminSnapshot = await firebase
            .database()
            .ref(`admins/${userId}`)
            .once("value");
          if (adminSnapshot.exists()) {
            navigation.replace("AdminHome");
            return;
          }

          const affiliateSnapshot = await firebase
            .database()
            .ref(`affiliates/${userId}`)
            .once("value");
          if (affiliateSnapshot.exists()) {
            navigation.replace("AffiliateHome");
            return;
          }

          const customerSnapshot = await firebase
            .database()
            .ref(`customers/${userId}`)
            .once("value");
          if (customerSnapshot.exists()) {
            navigation.replace("CustomerHome");
            return;
          }

          setError("User data not found.");
        } catch (error) {
          setError("Error fetching user data.");
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("Please fill in all fields.");
        setIsInvalid(true);
        return;
      }

      setLoading(true);
      setIsInvalid(false);

      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);

      const userId = response.user.uid;

      // Sequential role checks
      const adminSnapshot = await firebase
        .database()
        .ref(`admins/${userId}`)
        .once("value");
      if (adminSnapshot.exists()) {
        navigation.replace("AdminHome");
        return;
      }

      const affiliateSnapshot = await firebase
        .database()
        .ref(`affiliates/${userId}`)
        .once("value");
      if (affiliateSnapshot.exists()) {
        navigation.replace("AffiliateHome");
        return;
      }

      const customerSnapshot = await firebase
        .database()
        .ref(`customers/${userId}`)
        .once("value");
      if (customerSnapshot.exists()) {
        navigation.replace("CustomerHome");
        return;
      }

      setError("User data not found.");
      setIsInvalid(true);
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("Invalid email. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("User not found. Please check your credentials.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsInvalid(true);
    } finally {
      if (rememberMe) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
        await AsyncStorage.setItem("rememberMe", "false");
      }
      setLoading(false);
    }
  };

  const handleSignUp = () => navigation.navigate("CustomerRegistration");

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#095e69" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/vista-logo.png")}
              style={styles.logo}
            />
            <Text style={styles.loginTitle}>Log in to your Account</Text>
          </View>

          <View style={styles.formContainer}>
            <View
              style={[
                styles.inputWrapper,
                isInvalid && styles.errorInputWrapper,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                isInvalid && styles.errorInputWrapper,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-off" : "eye"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rememberForgotWrapper}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Ionicons
                  name={rememberMe ? "checkbox" : "square-outline"}
                  size={20}
                  color="#4C8C2C"
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("PasswordRecovery")}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text style={styles.registerLink} onPress={handleSignUp}>
              Register here
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 240,
    height: 160,
    resizeMode: "contain",
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4C8C2C",
  },
  formContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#4C8C2C",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center",
  },
  errorInputWrapper: {
    borderColor: "red", // Red border for invalid fields
  },
  input: {
    fontSize: 16,
    color: "#333",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  rememberForgotWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMeText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#4C8C2C",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#4C8C2C",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#4C8C2C",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#4C8C2C",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default LoginScreen;
