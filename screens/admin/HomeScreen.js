import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase";

const HomeScreen = () => {
  const [hotelAffiliatesCount, setHotelAffiliatesCount] = useState(0);
  const [resortAffiliatesCount, setResortAffiliatesCount] = useState(0);
  const [pendingSubscriptionsCount, setPendingSubscriptionsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const affiliatesRef = firebase.database().ref("affiliates");
        const subscriptionsRef = firebase.database().ref("subscription");

        affiliatesRef.on("value", (snapshot) => {
          const affiliatesData = snapshot.val();
          if (affiliatesData) {
            let hotelCount = 0;
            let resortCount = 0;
            Object.values(affiliatesData).forEach((affiliate) => {
              if (affiliate.affiliateType === "Hotel") {
                hotelCount++;
              } else if (affiliate.affiliateType === "Resort") {
                resortCount++;
              }
            });
            setHotelAffiliatesCount(hotelCount);
            setResortAffiliatesCount(resortCount);
          }
        });

        subscriptionsRef.on("value", (snapshot) => {
          const subscriptionsData = snapshot.val();
          if (subscriptionsData) {
            let pendingCount = 0;
            Object.values(subscriptionsData).forEach((subscription) => {
              if (subscription.status === "pending") {
                pendingCount++;
              }
            });
            setPendingSubscriptionsCount(pendingCount);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCounts();

    return () => {
      firebase.database().ref("affiliates").off("value");
      firebase.database().ref("subscription").off("value");
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <View style={styles.header}>
        <Image
          source={require("../../assets/vista.png")}
          style={styles.headerImage}
        />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.touchableOpacity, styles.firstTouchableOpacity]}
          disabled={true}
        >
          <View style={styles.touchableContent}>
            <View style={styles.textContainer}>
              <Text style={styles.touchableText}>{hotelAffiliatesCount}</Text>
              <Text style={styles.subText}>Hotels</Text>
            </View>
            <Image
              source={require("../../assets/icons/hotel-icon.png")}
              style={styles.icon}
              tintColor={"#4ab550"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.touchableOpacity, styles.secondTouchableOpacity]}
          disabled={true}
        >
          <View style={styles.touchableContent}>
            <View style={styles.textContainer}>
              <Text style={styles.touchableText}>{resortAffiliatesCount}</Text>
              <Text style={styles.subText}>Resorts</Text>
            </View>
            <Image
              source={require("../../assets/icons/resort-icon.png")}
              style={styles.icon}
              tintColor={"#d74e4e"}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.touchableOpacity, styles.thirdTouchableOpacity]}
          disabled={true}
        >
          <View style={styles.touchableContent}>
            <View style={styles.textContainer}>
              <Text style={styles.touchableText}>
                {pendingSubscriptionsCount}
              </Text>
              <Text style={styles.subText}>Pending Subscriptions</Text>
            </View>
            <Ionicons name="receipt" size={50} color={"#edae50"} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  headerImage: {
    width: 120,
    height: 30,
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  touchableOpacity: {
    backgroundColor: "#E25F5F",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: "100%",
    marginBottom: 10,
  },
  touchableContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  touchableText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 14,
    color: "white",
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  firstTouchableOpacity: {
    backgroundColor: "#6dc072",
  },
  secondTouchableOpacity: {
    backgroundColor: "#e25f5f",
  },
  thirdTouchableOpacity: {
    backgroundColor: "#ffc46b",
  },
});

export default HomeScreen;
