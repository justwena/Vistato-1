import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase.js";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BookingModal from "./BookingModal";

const CustomHeader = ({ title, onAddPress }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor={"white"} />
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
        <Ionicons name="add" size={24} color="black" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

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

const BookingItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.facilityItemContainer}
    onPress={() => onPress(item)}
  >
    <View style={styles.facilityLeft}>
      <View style={styles.leftContent}>
        <Image
          source={{ uri: item.facilityImage }}
          style={styles.facilityImage}
        />
        <View style={styles.facilityDetails}>
          <Text style={styles.facilityName}>{item.facilityName}</Text>
          <Text style={styles.affiliateUsername}>{item.affiliateName}</Text>
          <Text
            style={[
              styles.bookingStatus,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={15} color="#888" />
  </TouchableOpacity>
);

const TripScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("active");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigation = useNavigation();

  const fetchBookingStatus = (bookingId) => {
    const db = firebase.database();
    const bookingRef = db.ref(`bookings/${bookingId}/status`);

    bookingRef.on("value", (snapshot) => {
      const newStatus = snapshot.val();
      setBookings((prevBookings) => {
        return prevBookings.map((booking) => {
          if (booking.id === bookingId) {
            return { ...booking, status: newStatus };
          }
          return booking;
        });
      });
    });

    return () => bookingRef.off("value");
  };

  const fetchBookings = async () => {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        console.error("No authenticated user.");
        return;
      }

      const db = firebase.database();
      let bookingsRef;
      let fetchedBookings = [];

      switch (filter) {
        case "active":
          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("pending");
          fetchedBookings = await fetchBookingsWithStatus(bookingsRef, user);

          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("approved");
          fetchedBookings = fetchedBookings.concat(
            await fetchBookingsWithStatus(bookingsRef, user),
          );

          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("checked-in");
          fetchedBookings = fetchedBookings.concat(
            await fetchBookingsWithStatus(bookingsRef, user),
          );

          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("checked-out");
          fetchedBookings = fetchedBookings.concat(
            await fetchBookingsWithStatus(bookingsRef, user),
          );
          break;
        case "completed":
          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("completed");
          fetchedBookings = await fetchBookingsWithStatus(bookingsRef, user);
          break;
        case "declined":
          bookingsRef = db
            .ref("bookings")
            .orderByChild("status")
            .equalTo("declined");
          fetchedBookings = await fetchBookingsWithStatus(bookingsRef, user);
          break;
        default:
          break;
      }

      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching bookings: ", error);
    }
  };

  const fetchBookingsWithStatus = async (bookingsRef, user) => {
    const snapshot = await bookingsRef.once("value");
    const data = snapshot.val();
    const fetchedBookings = [];

    if (data) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const booking = { id: key, ...data[key] };
          if (booking.customerID === user.uid) {
            const { facilityID, affiliateID, ...bookingDetails } = booking;
            const facilitySnapshot = await firebase
              .database()
              .ref(`facilities/${affiliateID}/${facilityID}`)
              .once("value");
            const facilityData = facilitySnapshot.val();
            if (facilityData) {
              const facilityImage = facilityData.images?.[0] || null;
              const facilityName =
                facilityData.facilityName || "Unknown Facility";
              const affiliateSnapshot = await firebase
                .database()
                .ref(`affiliates/${affiliateID}`)
                .once("value");
              const affiliateData = affiliateSnapshot.val();
              const affiliateName =
                affiliateData?.username || "Unknown Affiliate";
              fetchedBookings.push({
                ...bookingDetails,
                facilityID,
                facilityName,
                facilityImage,
                affiliateName,
                affiliateID,
                affiliateData,
              });
              fetchBookingStatus(key);
            }
          }
        }
      }
    }

    return fetchedBookings;
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [filter]),
  );

  const handleAddPress = () => {
    navigation.navigate("AddTrip");
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleBookingPress = (booking) => {
    setSelectedBooking(booking);
  };

  return (
    <View style={styles.screen}>
      <CustomHeader title="Trips" onAddPress={handleAddPress} />

      <View style={styles.filterButtonsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "active"
                ? styles.activeFilterButton
                : styles.inactiveFilterButton,
            ]}
            onPress={() => handleFilterChange("active")}
          >
            <Text
              style={
                filter === "active"
                  ? styles.activeFilterButtonText
                  : styles.inactiveFilterButtonText
              }
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "completed"
                ? styles.activeFilterButton
                : styles.inactiveFilterButton,
            ]}
            onPress={() => handleFilterChange("completed")}
          >
            <Text
              style={
                filter === "completed"
                  ? styles.activeFilterButtonText
                  : styles.inactiveFilterButtonText
              }
            >
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "declined"
                ? styles.activeFilterButton
                : styles.inactiveFilterButton,
            ]}
            onPress={() => handleFilterChange("declined")}
          >
            <Text
              style={
                filter === "declined"
                  ? styles.activeFilterButtonText
                  : styles.inactiveFilterButtonText
              }
            >
              Declined
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {bookings.length > 0 ? (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookingItem item={item} onPress={handleBookingPress} />
            )}
          />
        ) : (
          <View style={styles.centeredMessageContainer}>
            <Ionicons name="warning" size={50} color="#FF6347" />
            <Text>No {filter} bookings found.</Text>
          </View>
        )}
      </View>

      <BookingModal
        visible={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        affiliateData={selectedBooking ? selectedBooking.affiliateData : null}
        facilityID={selectedBooking ? selectedBooking.facilityID : null}
        affiliateID={selectedBooking ? selectedBooking.affiliateID : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    color: "black",
    fontSize: 30,
    fontWeight: "bold",
  },
  addButton: {
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  screen: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  facilityItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  facilityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  facilityImage: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  facilityDetails: {
    flexDirection: "column",
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  affiliateUsername: {
    fontSize: 12,
    color: "#666",
  },
  bookingStatus: {
    fontSize: 14,
    marginTop: 5,
    color: "#088b9c",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#E8FCFF",
  },
  activeFilterButtonText: {
    color: "#088B9C",
  },
  filterButtonText: {
    color: "white",
  },
  inactiveFilterButton: {
    backgroundColor: "white",
  },
  inactiveFilterButtonText: {
    color: "black",
  },
});

export default TripScreen;
