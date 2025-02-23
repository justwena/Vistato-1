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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../firebase";

const AffiliateRegistration = ({ navigation }) => {
  const [affiliateType, setAffiliateType] = useState("hotel");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAffiliateRegister = async () => {
    try {
      setLoading(true);

      if (!username || !email || !contactNo || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      await firebase.database().ref(`affiliates/${response.user.uid}`).set({
        username,
        contactNo,
        email,
        affiliateType,
      });

      console.log("Affiliate registered successfully!", response.user.uid);

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
      // console.error("Error registering affiliate:", error.message);
      setLoading(false);
      setError(error.message);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#095e69" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.aboveText}>Sign Up</Text>
            <Text style={styles.mainText}>
              <Text style={styles.asText}>as </Text>
              <Text style={styles.affiliateText}>Affiliate</Text>
            </Text>

            <View style={styles.separator}></View>

            <View style={styles.registerButtonContainer}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={styles.signUpText}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.affiliateTypeContainer}>
                <Text style={styles.placeholder}>Affiliate Type</Text>
                <View style={styles.radioButtonsContainer}>
                  <TouchableOpacity
                    style={
                      affiliateType === "Hotel"
                        ? styles.selectedRadioButton
                        : styles.unselectedRadioButton
                    }
                    onPress={() => setAffiliateType("Hotel")}
                  >
                    <Text style={styles.radioLabel}>Hotel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      affiliateType === "Resort"
                        ? styles.selectedRadioButton
                        : styles.unselectedRadioButton
                    }
                    onPress={() => setAffiliateType("Resort")}
                  >
                    <Text style={styles.radioLabel}>Resort</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.placeholder}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  onChangeText={(text) => setUsername(text)}
                  value={username}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.placeholder}>Contact No.</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  onChangeText={(text) => setContactNo(text)}
                  value={contactNo}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.placeholder}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  onChangeText={(text) => setEmail(text)}
                  value={email}
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

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleAffiliateRegister}
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
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  aboveText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: -5,
  },
  mainText: {
    fontSize: 35,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  asText: {
    color: "white",
  },
  affiliateText: {
    color: "#ffc119",
  },
  separator: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    marginVertical: 10,
    marginHorizontal: 100,
    right: 100,
  },
  registerButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  registerText: {
    color: "white",
    fontSize: 14,
  },
  signUpText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  subText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
  },
  affiliateTypeContainer: {
    marginBottom: 15,
  },
  radioButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingRight: 50,
  },
  unselectedRadioButton: {
    flex: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    minWidth: 50,
  },
  selectedRadioButton: {
    flex: 1,
    backgroundColor: "#6dc072",
    borderRadius: 15,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    minWidth: 50,
  },
  radioLabel: {
    color: "white",
    marginLeft: 5,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 5,
    height: 66,
  },
  placeholder: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
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
  input: {
    height: 35,
    borderColor: "white",
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    fontSize: 14,
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
  error: {
    color: "white",
    textAlign: "center",
    backgroundColor: "#cf2129",
    padding: 10,
  },
  errorContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  eyeIconContainer: {
    padding: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default AffiliateRegistration;