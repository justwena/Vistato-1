import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// PaymentWindow component to handle payment input and submission.
const PaymentWindow = ({
    isVisible, // Boolean to control visibility of the modal.
    onClose, // Function to handle closing the modal.
    onSubmit, // Function to handle payment submission logic.
    affiliate, // Object containing affiliate details (e.g., GCash details).
    totalAmount, // Total amount for the booking/payment.
    tourTime, // Selected tour time.
    selectedFacility, // Selected facility information.
    adultGuests, // Number of adult guests.
    childGuests, // Number of child guests.
    checkInDate, // Selected check-in date.
    facilityId, // ID of the selected facility.
    username, // Username of the user making the booking.
    email, // Email address of the user.
    contactNo, // Contact number of the user.
    address, // Address of the user.
    navigation, // Navigation object for screen transitions.
    setPaymentWindowVisible, // Function to toggle modal visibility.
  }) => {
    // State variables for handling user inputs and submission status.
    const [referenceNumber, setReferenceNumber] = useState(""); // Reference number entered by the user.
    const [amountPaid, setAmountPaid] = useState(""); // Amount paid entered by the user.
    const [submitting, setSubmitting] = useState(false); // Submission status.
    const [bookingInProgress, setBookingInProgress] = useState(false); // Tracks if booking is in progress.
  
    // Reset function to clear inputs when modal is closed.
    const resetPaymentWindow = () => {
      setReferenceNumber("");
      setAmountPaid("");
    };
  
    // Calculates the downpayment amount (60% of the total).
    const downpayment = totalAmount * 0.6;
  
    // Handles the submission of payment details.
    const handleSubmit = async () => {
      try {
        const paidAmount = parseFloat(amountPaid); // Convert amountPaid to a number.
  
        // Validation: Check if the amount paid is a valid number.
        if (isNaN(paidAmount)) {
          Alert.alert(
            "Oops!",
            "Invalid amount paid. Please enter a valid number."
          );
          return;
        }
  
        // Validation: Check if paid amount matches the total or downpayment.
        if (paidAmount !== totalAmount && paidAmount !== downpayment) {
          Alert.alert(
            "Oops!",
            "The amount paid must be equal to either the total amount or the downpayment."
          );
          return;
        }
  
        // Prevent multiple submissions while booking is in progress.
        if (bookingInProgress) {
          return;
        }
  
        setBookingInProgress(true); // Set booking in progress.
        setSubmitting(true); // Indicate that submission is ongoing.
  
        // Call the onSubmit function with payment details.
        await onSubmit({ referenceNumber, amountPaid }, () => {
          onClose(); // Close the modal after submission.
          resetPaymentModal(); // Reset the input fields.
          setBookingInProgress(false); // Reset booking progress.
        });
      } catch (error) {
        console.error("Error during payment submission:", error.message); // Log errors.
        Alert.alert("Error", "Failed to submit payment. Please try again."); // Show error alert.
      } finally {
        setSubmitting(false); // Reset submitting state.
      }
    };
  
    return (
      <Modal visible={isVisible} transparent animationType="slide">
        {/* Main container for the modal */}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header with a title and close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.heading}>Payment Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  onClose(); // Close the modal.
                  resetPaymentWindow(); // Reset input fields.
                }}
              >
                <Ionicons name="close-outline" size={18} color="black" />
              </TouchableOpacity>
            </View>
  
            {/* Display affiliate payment details */}
            <View style={styles.paymentDetailsTextContainer}>
              <Image
                source={require("../assets/gcash-logo.png")} // Payment service logo.
                style={styles.paymentLogo}
              />
              <Text style={styles.paymentDetails}>
                {affiliate.gcashAccountName} {/* Affiliate GCash account name */}
              </Text>
              <Text style={styles.paymentDetailsValue}>
                {affiliate.gcashAccountNumber} {/* Affiliate GCash account number */}
              </Text>
            </View>
  
            {/* Inputs for reference number and amount paid */}
            <View style={styles.inputWrapper}>
              <Text style={styles.placeholder}>Reference Number:</Text>
              <TextInput
                style={styles.input}
                placeholder=""
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                keyboardType="numeric"
                maxLength={13} // Max 13 characters for reference number.
              />
              <Text style={styles.placeholder}>Amount Paid:</Text>
              <TextInput
                style={styles.input}
                placeholder=""
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="numeric" // Numeric input for amount.
              />
            </View>
  
            {/* Display total amount */}
            <View style={styles.totalAmountContainer}>
              <Text style={styles.amountLabel}>Total Amount:</Text>
              <Text style={styles.amountValue}>₱ {totalAmount.toFixed(2)}</Text>
            </View>
  
            {/* Separator for visual clarity */}
            <View style={styles.separator} />
  
            {/* Display downpayment amount */}
            <View style={styles.downpaymentContainer}>
              <Text style={styles.amountLabel}>Downpayment:</Text>
              <Text style={styles.downValue}>₱ {downpayment.toFixed(2)}</Text>
            </View>
  
            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitting ||
                  bookingInProgress ||
                  !referenceNumber ||
                  !amountPaid) &&
                  styles.submitButtonDisabled, // Disable button if conditions are unmet.
              ]}
              onPress={handleSubmit}
              disabled={
                submitting || bookingInProgress || !referenceNumber || !amountPaid
              }
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
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
    maxHeight: "100%",
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
  inputWrapper: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 10,
    marginTop: 5,
  },
  placeholder: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    height: 40,
    marginBottom: 10,
    color: "black",
  },
  reviewButtonContainer: {
    paddingBottom: 10,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    padding: 5,
  },
  paymentLogoContainer: {
    marginBottom: 0,
  },
  paymentLogo: {
    width: 150,
    height: 70,
  },
  paymentDetailsTextContainer: {
    marginBottom: 10,
  },
  paymentDetailsValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  paymentDetails: {
    fontSize: 15,
    fontStyle: "italic",
  },
  totalAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  amountLabel: {
    fontSize: 13,
    color: "#aaa",
  },
  amountValue: {
    fontSize: 13,
  },
  downValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  downpaymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default PaymentWindow;
