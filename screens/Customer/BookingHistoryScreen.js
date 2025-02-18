import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import firebase from "../../firebase.js";

const BookingHistoryScreen = () => {
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      const db = firebase.database();
      const snapshot = await db
        .ref("bookings")
        .orderByChild("status")
        .equalTo("completed")
        .once("value");
      console.log("Snapshot value:", snapshot.val());
      if (snapshot.exists()) {
        const completedBookingsData = snapshot.val();
        const completedBookingsArray = [];

        for (const key in completedBookingsData) {
          const booking = completedBookingsData[key];

          console.log("Facility ID:", booking.facilityID);

          const affiliateSnapshot = await db
            .ref(`affiliates/${booking.affiliateID}`)
            .once("value");
          const affiliateData = affiliateSnapshot.val();

          const customerSnapshot = await db
            .ref(`customers/${booking.customerID}`)
            .once("value");
          const customerData = customerSnapshot.val();

          const facilitySnapshot = await db
            .ref(`facilities/${booking.facilityID}`)
            .once("value");
          const facilityData = facilitySnapshot.val();

          const completedBooking = {
            ...booking,
            affiliateData,
            customerData,
            facilityData,
          };

          completedBookingsArray.push(completedBooking);
        }

        setCompletedBookings(completedBookingsArray);
      } else {
        console.log("No completed bookings found");
      }
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Bookings</Text>
      <FlatList
        data={completedBookings}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Text>
              Facility:{" "}
              {item.facilityData
                ? item.facilityData.facilityName
                : "Facility data not available"}
            </Text>
            <Text>
              Affiliate:{" "}
              {item.affiliateData
                ? item.affiliateData.username
                : "Affiliate data not available"}
            </Text>
            <Text>
              Customer:{" "}
              {item.customerData
                ? item.customerData.username
                : "Customer data not available"}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.bookingId}
        ListEmptyComponent={<Text>No completed bookings</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bookingItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});

export default BookingHistoryScreen;
