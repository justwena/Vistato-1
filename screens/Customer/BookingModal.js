import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase.js";

const BookingModal = ({
  visible,
  onClose,
  booking,
  affiliateData,
  facilityID,
  affiliateID,
}) => {
  if (!booking || !facilityID) {
    return null;
  }

  const [status, setStatus] = useState(booking.status);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  const openReviewModal = () => {
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setRating(0);
    setReview("");
    setReviewModalVisible(false);
  };

  const submitReview = async () => {
    if (!review || review.trim() === "") {
      Alert.alert("Oops!", "Please provide a review before submitting.");
      return;
    }

    try {
      const newReview = {
        rating: rating,
        review: review.trim(),
        facilityID: facilityID,
        affiliateID: affiliateID,
        customerID: booking.customerID,
      };

      const reviewsRef = firebase.database().ref("reviews");

      await reviewsRef.push(newReview);

      setRating(0);
      setReview("");

      closeReviewModal();

      Alert.alert("Review Submitted", "Thank you for your valuable feedback!");

      setReviewSubmitted(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again later.");
    }
  };

  const checkReviewExistence = async () => {
    try {
      const reviewsRef = firebase.database().ref("reviews");
      const snapshot = await reviewsRef
        .orderByChild("facilityID")
        .equalTo(facilityID)
        .once("value");
      const reviews = snapshot.val();
      if (reviews) {
        const bookingReview = Object.values(reviews).find(
          (review) =>
            review.facilityID === facilityID &&
            review.customerID === booking.customerID,
        );
        if (bookingReview) {
          setHasReview(true);
        }
      }
    } catch (error) {
      console.error("Error checking review existence:", error);
    }
  };

  useEffect(() => {
    if (visible && booking && facilityID) {
      checkReviewExistence();
    }
  }, [visible, booking, facilityID]);

  useEffect(() => {
    const fetchBookingStatus = () => {
      const db = firebase.database();
      const bookingRef = db.ref(`bookings/${booking.id}/status`);

      bookingRef.on("value", (snapshot) => {
        const newStatus = snapshot.val();
        setStatus(newStatus);
      });

      return () => bookingRef.off("value");
    };

    fetchBookingStatus();
  }, [booking.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#e25f5f";
      case "approved":
      case "checked-in":
      case "completed":
        return "#6dc072";
      case "checked-out":
      case "declined":
        return "#e25f5f";
      default:
        return "#000";
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StarRating = ({ maxStars, rating, onPress }) => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={24}
            color={i <= rating ? "#f8c102" : "#5be2cc"}
          />
        </TouchableOpacity>,
      );
    }
    return <View style={styles.starRating}>{stars}</View>;
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
                  <Text style={styles.sectionTitle}>Affiliate Details</Text>
                </View>
                <View style={styles.bookingDetail}>
                  <View style={styles.detailTextContainer}>
                    <Text>{affiliateData.username}</Text>
                    <Text style={styles.customerDetailText}>
                      {affiliateData.contactNo}
                    </Text>
                    <Text style={styles.customerDetailText}>
                      {affiliateData.email}
                    </Text>
                    <Text style={styles.customerDetailText}>
                      {affiliateData.address}
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
                  <View style={styles.bookingDetail}>
                    <Text style={styles.detailTitle}>Check-In Date:</Text>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailText}>
                        {formatDate(booking.checkInDate)}
                      </Text>
                    </View>
                  </View>
                )}
                {status !== "declined" && (
                  <View style={styles.bookingDetail}>
                    <Text style={styles.detailTitle}>Check-Out Date:</Text>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailText}>
                        {formatDate(booking.checkOutDate)}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Total Amount:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>
                      ₱ {booking.totalAmount}
                    </Text>
                  </View>
                </View>
                <View style={styles.bookingDetail}>
                  <Text style={styles.detailTitle}>Status:</Text>
                  <View style={styles.detailTextContainer}>
                    <Text
                      style={[
                        styles.detailText,
                        { color: getStatusColor(status) },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
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
                {status === "completed" && !hasReview && (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#6dc072" }]}
                    onPress={openReviewModal}
                  >
                    <Text style={styles.buttonText}>Write a Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={closeReviewModal}
      >
        <View style={styles.reviewModalContainer}>
          <View style={styles.reviewModalContent}>
            <Text style={styles.reviewHeading}>Rating & Review</Text>
            <Text style={styles.reviewLabel}>Rating</Text>
            <StarRating
              maxStars={5}
              rating={rating}
              onPress={setRating}
              style={styles.starRating}
            />
            <Text style={styles.reviewLabel}>Reviews</Text>
            <TextInput
              style={styles.reviewTextInput}
              multiline
              value={review}
              onChangeText={(text) => setReview(text)}
              placeholder="Write your review here..."
            />
            <View style={styles.reviewButtonContainer}>
              <TouchableOpacity
                style={[styles.reviewButton, { backgroundColor: "#a7a7a7" }]}
                onPress={closeReviewModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewButton, { backgroundColor: "#2ba6c7" }]}
                onPress={submitReview}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  reviewModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  reviewModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    width: "100%",
  },
  reviewHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  reviewLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 150,
    textAlignVertical: "top",
  },
  reviewButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  reviewButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: "#6dc072",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  starRating: {
    flexDirection: "row",
    marginBottom: 20,
  },
  starContainer: {
    marginRight: 5,
  },
});

export default BookingModal;
