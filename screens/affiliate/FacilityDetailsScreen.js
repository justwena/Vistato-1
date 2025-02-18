import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import firebase from "../../firebase.js";
import { Ionicons } from "@expo/vector-icons";

const FacilityDetailsScreen = ({ route, navigation }) => {
  const { facility: initialFacility } = route.params;
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFacility(initialFacility);
    setLoading(false);
  }, [initialFacility]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditPress = () => {
    navigation.navigate("EditFacility", { facility: facility });
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Facility",
      "Are you sure you want to delete this facility?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = firebase.auth().currentUser;
              if (!user) {
                console.error("No authenticated user.");
                return;
              }

              const userId = user.uid;
              const facilitiesRef = firebase
                .database()
                .ref(`facilities/${userId}`);

              await facilitiesRef.child(facility.id).remove();

              navigation.goBack();
            } catch (error) {
              console.error("Error deleting facility:", error);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleAvailabilityToggle = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.error("No authenticated user.");
        return;
      }

      const userId = user.uid;
      const facilityRef = firebase
        .database()
        .ref(`facilities/${userId}/${facility.id}`);

      const updatedAvailability =
        facility.availability === "Available" ? "Unavailable" : "Available";

      await facilityRef.update({ availability: updatedAvailability });

      setFacility((prevFacility) => ({
        ...prevFacility,
        availability: updatedAvailability,
      }));
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  const handleReviewsPress = () => {
    console.log("Facility ID:", facility.id);
    navigation.navigate("FacilityReviews", { facilityId: facility.id });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <StatusBar barStyle="dark-content" />
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#555" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{facility.facilityName}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleReviewsPress}
              style={[styles.headerButton, styles.headerButtonWithMargin]}
            >
              <Ionicons name="star" size={24} color="#FFB800" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEditPress}
              style={[styles.headerButton, styles.headerButtonWithMargin]}
            >
              <Ionicons name="create" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeletePress}
              style={[styles.headerButton, styles.headerButtonWithMargin]}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {facility.images.length > 0 && (
            <>
              <Image
                source={{ uri: facility.images[0] }}
                style={styles.bigFacilityImage}
              />

              <View style={styles.imageRow}>
                {facility.images.slice(1, 3).map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.smallFacilityImage}
                  />
                ))}
              </View>
            </>
          )}
          <Text style={styles.facilityName}>{facility.facilityName}</Text>
          <Text style={styles.facilityDescription}>{facility.description}</Text>

          <Text style={styles.emphasizedLabel}>{`Amenities:`}</Text>
          <Text style={styles.emphasizedText}>{facility.amenities}</Text>

          <Text style={styles.emphasizedLabel}>{`Day Tour Price:`}</Text>
          <Text style={styles.emphasizedText}>
            {facility.dayTourPrice.startTime} | ₱ {facility.dayTourPrice.price}
          </Text>

          <Text style={styles.emphasizedLabel}>{`Night Tour Price:`}</Text>
          <Text style={styles.emphasizedText}>
            {facility.nightTourPrice.startTime} | ₱{" "}
            {facility.nightTourPrice.price}
          </Text>

          <Text style={styles.emphasizedLabel}>{`Child Entrance Fee:`}</Text>
          <Text style={styles.emphasizedText}>
            ₱ {facility.childEntranceFee}
          </Text>

          <Text style={styles.emphasizedLabel}>{`Adult Entrance Fee:`}</Text>
          <Text style={styles.emphasizedText}>
            ₱ {facility.adultEntranceFee}
          </Text>

          <TouchableOpacity
            style={[
              styles.availabilityButton,
              {
                backgroundColor:
                  facility.availability === "Available" ? "#e25f5f" : "#6dc072",
              },
            ]}
            onPress={handleAvailabilityToggle}
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name={
                  facility.availability === "Available" ? "close" : "checkmark"
                }
                size={24}
                color="white"
              />
              <Text style={styles.availabilityButtonText}>
                {facility.availability === "Available"
                  ? "Mark Unavailable"
                  : "Mark Available"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "white",
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  headerButtonWithMargin: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 20,
  },
  bigFacilityImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  smallFacilityImage: {
    width: "48%",
    height: 100,
    borderRadius: 10,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  facilityDescription: {
    fontSize: 16,
    marginBottom: 0,
    textAlign: "justify",
  },
  emphasizedLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  emphasizedText: {
    fontSize: 16,
    marginBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 5,
  },
  availabilityButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  availabilityButtonText: {
    color: "white",
    marginLeft: 5,
  },
});

export default FacilityDetailsScreen;
