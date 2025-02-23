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

const PaymentModal = ({
  isVisible,
  onClose,
  onSubmit,
  affiliate,
  totalAmount,
  tourTime,
  selectedFacility,
  adultGuests,
  childGuests,
  checkInDate,
  facilityId,
  username,
  email,
  contactNo,
  address,
  navigation,
  setPaymentModalVisible,
}) => {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const resetPaymentModal = () => {
    setReferenceNumber("");
    setAmountPaid("");
  };

  const downpayment = totalAmount * 0.6;

  const handleSubmit = async () => {
    try {
      const paidAmount = parseFloat(amountPaid);

      if (isNaN(paidAmount)) {
        Alert.alert(
          "Oops!",
          "Invalid amount paid. Please enter a valid number.",
        );
        return;
      }

      if (paidAmount !== totalAmount && paidAmount !== downpayment) {
        Alert.alert(
          "Oops!",
          "The amount paid must be equal to either the total amount or the downpayment.",
        );
        return;
      }

      if (bookingInProgress) {
        return;
      }

      setBookingInProgress(true);
      setSubmitting(true);

      await onSubmit({ referenceNumber, amountPaid }, () => {
        onClose();
        resetPaymentModal();
        setBookingInProgress(false);
      });
    } catch (error) {
      console.error("Error during payment submission:", error.message);
      Alert.alert("Error", "Failed to submit payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.heading}>Payment Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                onClose();
                resetPaymentModal();
              }}
            >
              <Ionicons name="close-outline" size={18} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.paymentDetailsTextContainer}>
            <Image
              source={require("../assets/gcash-logo.png")}
              style={styles.paymentLogo}
            />
            <Text style={styles.paymentDetails}>
              {affiliate.gcashAccountName}
            </Text>
            <Text style={styles.paymentDetailsValue}>
              {affiliate.gcashAccountNumber}
            </Text>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.placeholder}>Reference Number:</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              keyboardType="numeric"
              maxLength={13}
            />
            <Text style={styles.placeholder}>Amount Paid:</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={amountPaid}
              onChangeText={setAmountPaid}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.totalAmountContainer}>
            <Text style={styles.amountLabel}>Total Amount:</Text>
            <Text style={styles.amountValue}>₱ {totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.downpaymentContainer}>
            <Text style={styles.amountLabel}>Downpayment:</Text>
            <Text style={styles.downValue}>₱ {downpayment.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting ||
                bookingInProgress ||
                !referenceNumber ||
                !amountPaid) &&
                styles.submitButtonDisabled,
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

export default PaymentModal;