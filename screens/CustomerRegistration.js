import React, { useState, useEffect } from "react";
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
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../firebase";

// Get screen width and height
const { width, height } = Dimensions.get("window");


const CustomerRegistration = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");


  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setUsername("");
      setContactNo("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setLoading(false);
      setUsernameError("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
    });


    return unsubscribe;
  }, [navigation]);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };
  
  const checkUsernameExists = async (username) => {
    const snapshot = await firebase.database().ref("customers").orderByChild("username").equalTo(username).once("value");
    return snapshot.exists();
  };

  const checkEmailExists = async (email) => {
    const snapshot = await firebase.database().ref("customers").orderByChild("email").equalTo(email).once("value");
    return snapshot.exists();
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (!username || !contactNo || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        setError("Password must be at least 6 characters long and contain both letters and numbers.");
        setLoading(false);
        return;
      }

            // Clear all previous errors
            setUsernameError("");
            setEmailError("");
            setPasswordError("");
            setConfirmPasswordError("");

      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        setUsernameError("Username is not available");
        setLoading(false);
        return;
      } else {
        setUsernameError(""); 
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError("Email already used");
        setLoading(false);
        return;
      } else {
        setEmailError(""); 
      }

      const response = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await firebase.database().ref(`customers/${response.user.uid}`).set({
        username,
        contactNo,
        email,
        password,
      });

      console.log("Customer registered successfully!", response.user.uid);
      setLoading(false);

      Alert.alert(
        "Registration Successful",
        "Your account has been successfully registered. Please login to continue.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleNavigateToAffiliateRegistration = () => {
    navigation.navigate("AffiliateRegistration");
  };
// Get the first error message to display
  const getErrorMessage = () => {
    if (usernameError) return usernameError;
    if (emailError) return emailError;
    if (passwordError) return passwordError;
    if (confirmPasswordError) return confirmPasswordError;
    return error; // Global error (like "Please fill in all fields")
  };

  // Check if there's any error globally
  const isError = error || usernameError || emailError;

  // Helper function to add a red border to all input fields if there is an error
  const getInputContainerStyle = () => {
    return isError ? [styles.inputContainer, { borderColor: "red" }] : styles.inputContainer;
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#095e69" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "null"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.contentWrapper}>
              <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={() => navigation.navigate("Login")}
              >
                <Image
                  source={require("../assets/backlogo.png")}
                  style={styles.backButtonImage}
                />
              </TouchableOpacity>

              <Image
                source={require("../assets/vista-logo.png")}
                style={styles.logoImage}
              />

              <Text style={styles.aboveText}>Sign Up</Text>
              <Text style={styles.mainText}>
                <Text style={styles.asText}>as </Text>
                <Text style={styles.customerText}>Customer</Text>
              </Text>

              <View style={styles.separator} />

              <View style={styles.registerButtonContainer}>
                <Text style={styles.registerText}>
                  Join Our Affiliate Program! Register{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleNavigateToAffiliateRegistration}
                >
                  <Text style={styles.signUpText}>here</Text>
                </TouchableOpacity>
              </View>

              <View style={getInputContainerStyle()}>
                <TextInput
                  style={[styles.input, { width: width * 0.8 }]}
                  placeholder="Enter Username"
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                />
              </View>

              <View style={getInputContainerStyle()}>
                <TextInput
                  style={[styles.input, { width: width * 0.8 }]}
                  placeholder="Enter Contact Number"
                  value={contactNo}
                  onChangeText={(text) => setContactNo(text)}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

              <View style={getInputContainerStyle()}>
                <TextInput
                  style={[styles.input, { width: width * 0.8 }]}
                  placeholder="Enter Email"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  autoCapitalize="none"
                />
              </View>

              <View style={getInputContainerStyle()}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passInput}
                    placeholder="Enter Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  >
                    <Ionicons
                      name={secureTextEntry ? "eye-off" : "eye"}
                      size={24}
                      color="#333"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={getInputContainerStyle()}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passInput, { width: width * 0.8 }]}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => setConfirmPassword(text)}
                    secureTextEntry={confirmSecureTextEntry}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() =>
                      setConfirmSecureTextEntry(!confirmSecureTextEntry)
                    }
                  >
                    <Ionicons
                      name={confirmSecureTextEntry ? "eye-off" : "eye"}
                      size={24}
                      color="#333"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Display errors above the register button */}
              <View style={styles.errorContainer}>
                {error && <Text style={styles.error}>{error}</Text>}
                {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              </View>

              <View style={styles.buttonContainer}>
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
    justifyContent: "center",
    alignItems: "center",
  },
 
  logoImage: {
    position: "absolute",
    top: 3,
    right: -10,
    width: 140,
    height: 140,
    resizeMode: "contain",
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
    top: 20,
    left: -15,
    resizeMode: "contain",
  },
  aboveText: {
    color: "#CBA656",
    fontSize: 18,
    marginLeft: 15,
    marginTop: 50,
  },
  mainText: {
    color: "#4C8C2C",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 34,
  },
  asText: {
    fontWeight: "normal",
   
  },
  customerText: {
    fontWeight: "bold",
    color: "#0CB695",
  },
  separator: {
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  registerButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  registerText: {
    color: "#CBA656",
    fontSize: 14,
    marginRight: 5,
  },
  signUpText: {
    color: "#0CB695",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  
  inputContainer: {
    marginBottom: 15,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#4C8C2C",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center",
  },
  placeholder: {
    color: "#4C8C2C",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#262626",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  passInput: {
    flex: 1,
    height: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#262626",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIconContainer: {
    padding: 5,
    marginLeft: 10,
  },
  errorContainer: {
    marginBottom: 10,
  },
  error: {
    color: "#fff",
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  registerButton: {
    backgroundColor: "#4C8C2C", // Updated color
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.8, // Adjust width dynamically
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },

 errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  error: {
    color: "#fff",
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 14,
  },
});


export default CustomerRegistration;