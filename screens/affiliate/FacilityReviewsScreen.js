import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import firebase from "../../firebase.js";

const CustomHeader = ({ title, navigation }) => (
  <View style={styles.header}>
    <Ionicons
      name="chevron-back"
      size={24}
      color="black"
      onPress={() => navigation.goBack()}
      style={styles.backIcon}
    />
    <Text style={styles.title}>{title}</Text>
  </View>
);

const FacilityReviewsScreen = ({ route, navigation }) => {
  const { facilityId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facilityImage, setFacilityImage] = useState(null);
  const [facilityName, setFacilityName] = useState("");
  const [affiliateUsername, setAffiliateUsername] = useState("");
  const [averageRating, setAverageRating] = useState(0);

  const StarRating = ({ rating, size }) => {
    const renderStar = (index) => {
      const isHalf = index - 0.5 === rating;
      const isFilled = index <= rating;

      return (
        <View key={index} style={styles.starContainer}>
          <MaterialCommunityIcons
            name={isHalf ? "star-half" : isFilled ? "star" : "star"}
            size={size}
            color={isHalf ? "#FFB800" : isFilled ? "#FFB800" : "white"}
            style={styles.starIcon}
          />
          {index === Math.ceil(rating) && (
            <Text style={styles.ratingText}>{rating}</Text>
          )}
        </View>
      );
    };

    return (
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
      </View>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsRef = firebase
          .database()
          .ref(`reviews`)
          .orderByChild("facilityID")
          .equalTo(facilityId);
        const snapshot = await reviewsRef.once("value");
        const reviewsData = snapshot.val();

        if (reviewsData) {
          const reviewsArray = Object.values(reviewsData);
          const reviewsWithCustomerData = await Promise.all(
            reviewsArray.map(async (review) => {
              const customerSnapshot = await firebase
                .database()
                .ref(`customers/${review.customerID}`)
                .once("value");
              const customerData = customerSnapshot.val();
              return { ...review, customerData };
            }),
          );
          setReviews(reviewsWithCustomerData);

          const totalRating = reviewsArray.reduce(
            (acc, curr) => acc + curr.rating,
            0,
          );
          const avgRating = totalRating / reviewsArray.length;
          setAverageRating(avgRating);
        } else {
          setReviews([]);
        }

        const user = firebase.auth().currentUser;
        if (!user) {
          console.error("No authenticated user.");
          return;
        }

        const userId = user.uid;
        const facilityRef = firebase
          .database()
          .ref(`facilities/${userId}/${facilityId}`);
        const facilitySnapshot = await facilityRef.once("value");
        const facilityData = facilitySnapshot.val();

        if (facilityData) {
          setFacilityName(facilityData.facilityName || "No Facility Name");
          if (facilityData.images && facilityData.images.length > 0) {
            setFacilityImage(facilityData.images[0]);
          }

          const affiliateRef = firebase
            .database()
            .ref(`affiliates/${userId}/username`);
          const affiliateSnapshot = await affiliateRef.once("value");
          const affiliateUsername = affiliateSnapshot.val();
          setAffiliateUsername(affiliateUsername || "");
        } else {
          console.warn("Facility not found");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [facilityId]);

  return (
    <View style={styles.container}>
      <CustomHeader title="Ratings & Reviews" navigation={navigation} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#088B9C" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.screen}>
            <View style={styles.imageContainer}>
              {facilityImage ? (
                <Image
                  source={{ uri: facilityImage }}
                  style={styles.facilityImage}
                />
              ) : (
                <Text>No image available</Text>
              )}
            </View>

            <View style={styles.facilityInfoContainer}>
              <Text style={styles.affiliateUsername}>{affiliateUsername}</Text>
              <Text style={styles.facilityName}>{facilityName}</Text>
              {averageRating > 0 ? (
                <StarRating rating={averageRating} size={20} />
              ) : (
                <Text style={styles.noReviewsText}>No ratings yet</Text>
              )}
            </View>

            <View style={styles.reviewsContainer}>
              <Text style={styles.reviewsTitle}>Reviews</Text>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <View
                    key={index}
                    style={[
                      styles.reviewItem,
                      index !== reviews.length - 1 && styles.reviewSeparator,
                    ]}
                  >
                    <View style={styles.customerContainer}>
                      <View style={styles.customerInfo}>
                        <Image
                          source={
                            review.customerData.profilePicture
                              ? { uri: review.customerData.profilePicture }
                              : require("../../assets/profile-picture.jpg")
                          }
                          style={styles.profilePicture}
                        />
                        <View style={styles.customerNameRating}>
                          <Text style={styles.customerName}>
                            {review.customerData.username}
                          </Text>
                          <StarRating rating={review.rating} size={15} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.reviewTextContainer}>
                      <Text style={styles.reviewText}>{review.review}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>No reviews available</Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
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
  title: {
    color: "black",
    fontSize: 16,
    marginLeft: 10,
  },
  backIcon: {
    position: "absolute",
    left: 15,
  },
  facilityInfoContainer: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 5,
  },
  affiliateUsername: {
    fontSize: 14,
    color: "#5B5B5B",
  },
  facilityName: {
    fontSize: 30,
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
  },
  facilityImage: {
    width: "100%",
    height: 200,
  },
  reviewsContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 5,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 10,
  },
  customerContainer: {
    marginBottom: 5,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerNameRating: {
    flexDirection: "column",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: -5,
  },
  reviewTextContainer: {
    marginTop: 5,
    marginLeft: 50,
  },
  reviewText: {
    fontSize: 15,
    color: "#5B5B5B",
  },
  noReviewsText: {
    fontSize: 15,
    color: "#5B5B5B",
  },
  starRatingContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#5B5B5B",
  },
});

export default FacilityReviewsScreen;
