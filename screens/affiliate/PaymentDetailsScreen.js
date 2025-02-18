import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase.js";

const PaymentDetailsHeader = ({ onBackPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerIcon}>
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Payment Details</Text>
  </View>
);

const PaymentDetailsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const [originalGcashAccountName, setOriginalGcashAccountName] = useState("");
  const [originalGcashAccountNumber, setOriginalGcashAccountNumber] =
    useState("");
  const [gcashAccountName, setGcashAccountName] = useState("");
  const [gcashAccountNumber, setGcashAccountNumber] = useState("");
  const [isGcashButtonEnabled, setIsGcashButtonEnabled] = useState(false);
  const [isGcashSaving, setIsGcashSaving] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const currentUser = firebase.auth().currentUser;

        if (currentUser) {
          const currentUserId = currentUser.uid;

          const snapshot = await firebase
            .database()
            .ref(`affiliates/${currentUserId}`)
            .once("value");
          const data = snapshot.val();

          if (data) {
            setOriginalGcashAccountName(data.gcashAccountName || "");
            setOriginalGcashAccountNumber(data.gcashAccountNumber || "");
            setGcashAccountName(data.gcashAccountName || "");
            setGcashAccountNumber(data.gcashAccountNumber || "");
          } else {
            console.log("No data found for the current affiliate");
          }
        } else {
          console.log("No user is currently logged in");
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  useEffect(() => {
    setIsGcashButtonEnabled(
      gcashAccountName !== originalGcashAccountName ||
        gcashAccountNumber !== originalGcashAccountNumber,
    );
  }, [
    gcashAccountName,
    gcashAccountNumber,
    originalGcashAccountName,
    originalGcashAccountNumber,
  ]);

  const handleSaveGcashDetails = async () => {
    setIsGcashSaving(true);
    try {
      const currentUser = firebase.auth().currentUser;

      if (currentUser) {
        const currentUserId = currentUser.uid;

        const isNameEdited = gcashAccountName !== originalGcashAccountName;
        const isNumberEdited =
          gcashAccountNumber !== originalGcashAccountNumber;

        if (isNameEdited || isNumberEdited) {
          await firebase.database().ref(`admins/${currentUserId}`).update({
            gcashAccountName,
            gcashAccountNumber,
          });

          setOriginalGcashAccountName(gcashAccountName);
          setOriginalGcashAccountNumber(gcashAccountNumber);

          Alert.alert("Success", "GCash details saved successfully!");
          setIsGcashButtonEnabled(false);

          const adminsRef = firebase.database().ref(`admins/${currentUserId}`);
          const snapshot = await adminsRef.once("value");
          const adminData = snapshot.val();
          const username = adminData.username || "Unknown Admin";

          let logMessage = `${username} updated GCash details.`;

          if (isNameEdited) {
            logMessage += ` Account Name changed to ${gcashAccountName}.`;
          }

          if (isNumberEdited) {
            logMessage += ` Account Number changed to ${gcashAccountNumber}.`;
          }

          const logsRef = firebase.database().ref(`logs/${currentUserId}`);
          const newLogRef = logsRef.push();
          newLogRef.set({
            message: logMessage,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
          });
        } else {
          Alert.alert("Info", "No changes detected in GCash details.");
        }
      } else {
        console.log("No user is currently logged in");
      }
    } catch (error) {
      console.error("Error saving GCash details:", error);
      Alert.alert("Error", "Failed to save GCash details. Please try again.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsGcashSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PaymentDetailsHeader onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#088b9c" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView style={styles.paymentDetailsContainer}>
            <PaymentDetailsForm
              labelName="Account Name"
              labelNumber="Account Number"
              valueName={gcashAccountName}
              valueNumber={gcashAccountNumber}
              onChangeName={setGcashAccountName}
              onChangeNumber={setGcashAccountNumber}
              onSave={handleSaveGcashDetails}
              isSaving={isGcashSaving}
              isDisabled={!isGcashButtonEnabled}
              headingImageSource={require("../../assets/gcash-logo.png")}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const PaymentDetailsForm = ({
  heading,
  labelName,
  labelNumber,
  valueName,
  valueNumber,
  onChangeName,
  onChangeNumber,
  onSave,
  isSaving,
  isDisabled,
  headingImageSource,
}) => (
  <View style={styles.formContainer}>
    <View style={styles.headingContainer}>
      <Image source={headingImageSource} style={styles.headingImage} />
      <Text style={styles.heading}>{heading}</Text>
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>{labelName}:</Text>
      <TextInput
        style={styles.input}
        value={valueName}
        onChangeText={onChangeName}
        placeholder={`Enter your ${labelName.toLowerCase()}`}
      />
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{labelNumber}:</Text>
      <TextInput
        style={styles.input}
        value={valueNumber}
        onChangeText={(text) => {
          if (/^\d{0,11}$/.test(text)) {
            onChangeNumber(text);
          }
        }}
        placeholder={`Enter your ${labelNumber.toLowerCase()}`}
        keyboardType="numeric"
        maxLength={11}
      />
    </View>

    <TouchableOpacity
      style={[styles.saveButton, isDisabled && styles.disabledButton]}
      onPress={onSave}
      disabled={isDisabled}
    >
      {isSaving ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.saveButtonText}>Save</Text>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    color: "black",
    fontSize: 16,
    marginLeft: 10,
  },
  headerIcon: {
    position: "absolute",
    left: 15,
  },
  paymentDetailsContainer: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headingImage: {
    width: 150,
    height: 50,
    marginRight: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dbdbdb",
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
    color: "#8d8d8d",
  },
  input: {
    height: 40,
    borderColor: "#b3b3b3",
    borderWidth: 1,
    marginBottom: 0,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 20,
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#088b9c",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 0,
    alignSelf: "flex-end",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
  },
  disabledButton: {
    paddingVertical: 10,
    backgroundColor: "#bdc3c7",
  },
});

export default PaymentDetailsScreen;
