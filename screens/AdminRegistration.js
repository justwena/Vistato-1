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
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../firebase";

const AdminRegistration = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
  
      // Check if all fields are filled
      if (!username || !contactNo || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }
  
      // Validate username (no numbers allowed)
      if (!/^[A-Za-z\s]+$/.test(username)) {
        setError("Username must contain only letters and spaces.");
        setLoading(false);
        return;
      }
  
      // Validate contact number (must be exactly 10 digits)
      if (!/^\d{10}$/.test(contactNo)) {
        setError("Contact number must be exactly 10 digits.");
        setLoading(false);
        return;
      }
  
      // Validate email format (must be a valid Gmail address)
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        setError("Please enter a valid Gmail address.");
        setLoading(false);
        return;
      }
  
      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
  
      // Register the user in Firebase
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
  
      await firebase.database().ref(`admins/${response.user.uid}`).set({
        username,
        contactNo,
        email,
        password,
      });
  
      console.log("Admin registered successfully:", response.user.uid);
      setLoading(false);
      navigation.navigate("AdminHome");
    } catch (error) {
      // Handle errors
      setLoading(false);
      setError(error.message);
    }
  };
  

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#095e69" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "null"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.contentContainer}>
            <View style={styles.contentWrapper}>
              <Text style={styles.aboveText}>Sign Up</Text>
              <Text style={styles.subText}>Register an Admin Account</Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.placeholder}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.placeholder}>Contact No.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={contactNo}
                    onChangeText={(text) => setContactNo(text)}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.placeholder}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.placeholder}>Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passInput}
                      placeholder=""
                      secureTextEntry={secureTextEntry}
                      onChangeText={(text) => setPassword(text)}
                      value={password}
                    />
                    <View style={styles.eyeIconContainer}>
                      <TouchableOpacity
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      >
                        <Ionicons
                          name={secureTextEntry ? "eye-off" : "eye"}
                          size={24}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.placeholder}>Confirm Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passInput}
                      placeholder=""
                      secureTextEntry={confirmSecureTextEntry}
                      onChangeText={(text) => setConfirmPassword(text)}
                      value={confirmPassword}
                    />
                    <View style={styles.eyeIconContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          setConfirmSecureTextEntry(!confirmSecureTextEntry)
                        }
                      >
                        <Ionicons
                          name={confirmSecureTextEntry ? "eye-off" : "eye"}
                          size={24}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.errorContainer}>
                  {error && <Text style={styles.error}>{error}</Text>}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("LoginScreen")}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Register</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  aboveText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 5,
    alignSelf: "center",
  },
  subText: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
  },
  inputContainer: {
    marginBottom: 0,
  },
  placeholder: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 35,
    borderColor: "white",
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 20,
    fontSize: 14,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  passInput: {
    flex: 1,
    height: 35,
    borderColor: "white",
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    fontSize: 14,
  },
  eyeIconContainer: {
    padding: 5,
  },
  errorContainer: {
    marginBottom: 10,
  },
  error: {
    color: "white",
    textAlign: "center",
    backgroundColor: "#cf2129",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
  registerButton: {
    backgroundColor: "#088B9C",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    width: 130,
  },
  backButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    width: 130,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
});

export default AdminRegistration;
