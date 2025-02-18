import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import firebase from "../../firebase";
import { Ionicons } from "@expo/vector-icons";

const SubscriptionModal = ({
  visible,
  onClose,
  subscription,
  subscriptionId,
}) => {
  const [affiliate, setAffiliate] = useState(null);

  useEffect(() => {
    if (subscription) {
      const fetchAffiliate = async () => {
        try {
          const affiliateRef = firebase
            .database()
            .ref(`affiliates/${subscription.affiliateId}`);
          affiliateRef.once("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setAffiliate(data);
            }
          });
        } catch (error) {
          console.error("Error fetching affiliate:", error);
        }
      };

      fetchAffiliate();
    }
  }, [subscription]);

  const handleApprove = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.error("No authenticated user.");
        Alert.alert(
          "Error",
          "Failed to approve subscription. No authenticated user.",
        );
        return;
      }

      const adminSnapshot = await firebase
        .database()
        .ref(`admins/${user.uid}`)
        .once("value");
      const adminData = adminSnapshot.val();
      const adminUsername = adminData ? adminData.username : user.email;

      const affiliateSnapshot = await firebase
        .database()
        .ref(`affiliates/${subscription.affiliateId}`)
        .once("value");
      const affiliateData = affiliateSnapshot.val();
      const affiliateUsername = affiliateData
        ? affiliateData.username
        : "Unknown Affiliate";

      const logMessage = `${adminUsername} approved the subscription for affiliate ${affiliateUsername} with ID: ${subscriptionId}`;

      await firebase.database().ref(`logs/${user.uid}`).push({
        userId: user.uid,
        message: logMessage,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      await firebase
        .database()
        .ref(`subscription/${subscription.id}/status`)
        .set("approved");

      Alert.alert(
        "Subscription Approved",
        "The subscription has been approved successfully!",
        [
          {
            text: "OK",
            onPress: onClose,
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error("Error approving subscription:", error);
      Alert.alert(
        "Error",
        "Failed to approve subscription. Please try again later.",
      );
    }
  };

  const handleDecline = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.error("No authenticated user.");
        Alert.alert(
          "Error",
          "Failed to decline subscription. No authenticated user.",
        );
        return;
      }

      const adminSnapshot = await firebase
        .database()
        .ref(`admins/${user.uid}`)
        .once("value");
      const adminData = adminSnapshot.val();
      const adminUsername = adminData ? adminData.username : user.email;

      const affiliateSnapshot = await firebase
        .database()
        .ref(`affiliates/${subscription.affiliateId}`)
        .once("value");
      const affiliateData = affiliateSnapshot.val();
      const affiliateUsername = affiliateData
        ? affiliateData.username
        : "Unknown Affiliate";

      const logMessage = `${adminUsername} declined the subscription for affiliate ${affiliateUsername} with ID: ${subscriptionId}`;

      await firebase.database().ref(`logs/${user.uid}`).push({
        userId: user.uid,
        message: logMessage,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      await firebase
        .database()
        .ref(`subscription/${subscription.id}/status`)
        .set("declined");

      Alert.alert(
        "Subscription Declined",
        "The subscription has been declined successfully!",
        [
          {
            text: "OK",
            onPress: onClose,
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error("Error declining subscription:", error);
      Alert.alert(
        "Error",
        "Failed to decline subscription. Please try again later.",
      );
    }
  };

  if (!subscription || !affiliate) {
    return null;
  }

  const getStatusTextColor = (status) => {
    switch (status) {
      case "pending":
      case "declined":
        return "#e25f5f";
      case "approved":
        return "#6dc072";
      default:
        return "#000";
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.heading}>Subscription Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-outline" size={18} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.paymentSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="card-outline"
                  size={16}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.sectionTitle}>Payment Details</Text>
              </View>
              <View style={styles.bookingDetail}>
                <Text style={styles.detailTitle}>Reference Number:</Text>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailText}>
                    {subscription.referenceNumber}
                  </Text>
                </View>
                <Text style={styles.detailTitle}>Amount Paid:</Text>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailText}>
                    ₱ {subscription.amountPaid}
                  </Text>
                </View>
                <Text style={styles.detailTitle}>Status:</Text>
                <View style={styles.detailTextContainer}>
                  <Text
                    style={[
                      styles.detailText,
                      { color: getStatusTextColor(subscription.status) },
                    ]}
                  >
                    {capitalizeFirstLetter(subscription.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {subscription.status === "pending" && (
              <>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#e25f5f" }]}
                  onPress={handleDecline}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
                <View style={{ flex: 0.1 }} />
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#6dc072" }]}
                  onPress={handleApprove}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  icon: {
    marginRight: 4,
  },
  detailTitle: {
    marginBottom: 5,
    color: "#888",
  },
  detailText: {
    fontSize: 14,
    marginBottom: 10,
  },
  bookingDetail: {
    marginBottom: 5,
    marginLeft: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});

export default SubscriptionModal;
