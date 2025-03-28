import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase.js";

const BookingModal = ({ visible, onClose, booking, status, affiliateId }) => {
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const db = firebase.database();
        const bookingSnapshot = await db
          .ref(`bookings/${booking.id}`)
          .once("value");
        const bookingData = bookingSnapshot.val();

        if (
          bookingData.customerID !== null &&
          bookingData.customerID !== undefined
        ) {
          console.log("Booking customerID:", bookingData.customerID);
          const customerSnapshot = await db
            .ref(`customers/${bookingData.customerID}`)
            .once("value");
          const customerData = customerSnapshot.val();
          console.log("Fetched customer details:", customerData);
          if (customerData) {
            setCustomerDetails(customerData);
          } else {
            console.log("Customer data not found");
            setCustomerDetails(null);
          }
        } else {
          if (
            bookingData.customerDetails !== null &&
            bookingData.customerDetails !== undefined
          ) {
            console.log(
              "No customer ID found for this booking, using customerDetails from booking.",
            );
            setCustomerDetails(bookingData.customerDetails);
          } else {
            console.log(
              "No customer ID or customerDetails found for this booking",
            );
            setCustomerDetails(null);
          }
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
        setCustomerDetails(null);
      }
    };

    fetchCustomerDetails();
  }, [booking]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  
  const handleDecline = async () => {
    try {
      Alert.alert(
        "Confirm Decline",
        "Are you sure you want to decline this booking?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Decline",
            onPress: async () => {
              const db = firebase.database();

              await db
                .ref(`bookings/${booking.id}`)
                .update({
                  status: "declined",
                  checkInDate: null,
                  checkOutDate: null,
                });
              console.log("Booking declined");

              const bookingSnapshot = await db
                .ref(`bookings/${booking.id}`)
                .once("value");
              const bookingData = bookingSnapshot.val();
              const { affiliateID, facilityID } = bookingData;

              const logMessage = `Booking for facility ${booking.facilityName} declined.`;

              const logsRef = db.ref(`logs/${affiliateID}`);
              const newLogRef = logsRef.push();
              newLogRef.set({
                message: logMessage,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
              });

              await db
                .ref(`facilities/${affiliateID}/${facilityID}`)
                .update({ availability: "Available" });
              console.log("Facility availability updated to Available");

              onClose();
              Alert.alert("Success", "Booking declined successfully");
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error("Error declining booking:", error);
      Alert.alert("Error", "Failed to decline booking");
    }
  };

  const handleApprove = async () => {
    try {
      const db = firebase.database();
      await db.ref(`bookings/${booking.id}`).update({ status: "approved" });
      console.log("Booking approved");

      const logMessage = `Booking for facility ${booking.facilityName} approved.`;

      const logsRef = db.ref(`logs/${affiliateId}`);
      const newLogRef = logsRef.push();
      newLogRef.set({
        message: logMessage,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      onClose();
      Alert.alert("Success", "Booking approved successfully");
    } catch (error) {
      console.error("Error approving booking:", error);
      Alert.alert("Error", "Failed to approve booking");
    }
  };

  const handleCheckIn = async () => {
    try {
      const db = firebase.database();
      await db.ref(`bookings/${booking.id}`).update({ status: "checked-in" });
      console.log("Booking checked in");
      onClose();
      Alert.alert("Success", "Booking checked in successfully");
    } catch (error) {
      console.error("Error checking in booking:", error);
      Alert.alert("Error", "Failed to check in booking");
    }
  };

  const handleCheckout = async () => {
    try {
      const db = firebase.database();
      const currentDate = Date.now();
      await db.ref(`bookings/${booking.id}`).update({
        status: "checked-out",
        checkOutDate: currentDate,
      });
      console.log("Booking checked out");
      onClose();
      Alert.alert("Success", "Booking checked out successfully");
    } catch (error) {
      console.error("Error checking out booking:", error);
      Alert.alert("Error", "Failed to check out booking");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete this booking?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        { text: "Delete", onPress: () => performDelete() },
      ],
      { cancelable: false },
    );
  };

  const performDelete = async () => {
    try {
      const currentUser = firebase.auth().currentUser;

      console.log("Affiliate ID:", affiliateId);

      if (currentUser && currentUser.uid === affiliateId) {
        const db = firebase.database();
        await db.ref(`bookings/${booking.id}`).update({ isDeleted: true });
        console.log("Booking marked as deleted");
        onClose();
        Alert.alert("Success", "Booking marked as deleted");
      } else {
        Alert.alert("Error", "You are not authorized to delete this booking");
      }
    } catch (error) {
      console.error("Error marking booking as deleted:", error);
      Alert.alert("Error", "Failed to mark booking as deleted");
    }
  };

  const handleComplete = async () => {
    try {
      const db = firebase.database();
      await db.ref(`bookings/${booking.id}`).update({ status: "completed" });
      console.log("Booking marked as completed");

      const logMessage = `Booking for facility ${booking.facilityName} marked as completed.`;

      const logsRef = db.ref(`logs/${affiliateId}`);
      const newLogRef = logsRef.push();
      newLogRef.set({
        message: logMessage,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });

      onClose();
      Alert.alert("Success", "Booking marked as completed");
    } catch (error) {
      console.error("Error completing booking:", error);
      Alert.alert("Error", "Failed to mark booking as completed");
    }
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
            <Text style={styles.heading}>{booking.facilityName}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-outline" size={18} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.modalBody}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.sectionTitle}>Customer Details</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <View style={styles.detailTextContainer}>
                    <Text>
                      {customerDetails
                        ? customerDetails.username
                        : "Loading..."}
                    </Text>
                    <Text style={styles.customerDetailText}>
                      {customerDetails ? customerDetails.contactNo : ""}
                    </Text>
                    <Text style={styles.customerDetailText}>
                      {customerDetails ? customerDetails.email : ""}
                    </Text>
                    <Text style={styles.customerDetailText}>
                      {customerDetails ? customerDetails.address : ""}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.sectionTitle}>Booking Details</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Facility Name:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>
                      {booking.facilityName}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Adult Guests:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>{booking.adultGuests}</Text>
                  </View>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Child Guests:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>{booking.childGuests}</Text>
                  </View>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Tour Time:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>{booking.tourTime}</Text>
                  </View>
                </View>
                {status !== "declined" && (
                  <>
                    <View style={styles.bookingDetail}>
                      <Text style={styles.detailTitle}>Check-In Date:</Text>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailText}>
                          {formatDate(booking.checkInDate)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.bookingDetail}>
                      <Text style={styles.detailTitle}>Check-Out Date:</Text>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailText}>
                          {formatDate(booking.checkOutDate)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Total Amount:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>
                      ₱ {booking.totalAmount}
                    </Text>
                  </View>
                </View>
              </View>
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
                      {booking.referenceNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Amount Paid:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>
                      ₱ {booking.amountPaid}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                {status === "approved" ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#6dc072" }]}
                    onPress={handleCheckIn}
                  >
                    <Text style={styles.buttonText}>Check In</Text>
                  </TouchableOpacity>
                ) : status === "declined" ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#e25f5f" }]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                ) : status === "checked-in" ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#e25f5f" }]}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.buttonText}>Check Out</Text>
                  </TouchableOpacity>
                ) : status === "checked-out" ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#2ba6c7" }]}
                    onPress={handleComplete}
                  >
                    <Text style={styles.buttonText}>Completed</Text>
                  </TouchableOpacity>
                ) : status === "completed" ? null : (
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
          </ScrollView>
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
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
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
  bookingDetail: {
    marginBottom: 5,
    marginLeft: 25,
  },
  detailTitle: {
    marginBottom: 5,
    color: "#888",
  },
  detailText: {
    fontSize: 14,
  },
  customerDetailText: {
    fontSize: 14,
    color: "#888",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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

export default BookingModal;
