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
          source={require("../../assets/vista-logo.png")}
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
              <Text style={styles.subText}>HOTELS</Text>
            </View>
            <Image
              source={require("../../assets/icons/hotel-icon.png")}
              style={styles.icon}
              tintColor={"#FFF4E8"}
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
              <Text style={styles.subText}>RESORTS</Text>
            </View>
            <Image
              source={require("../../assets/icons/resort-icon.png")}
              style={styles.icon}
              tintColor={"#FFF4E8"}
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
              <Text style={styles.subText}>PENDING SUBSCRIPTIONS</Text>
            </View>
            <Ionicons name="receipt" size={40} color={"#FFF4E8"} />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  headerImage: {
    width: 120,
    height: 39,
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
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  firstTouchableOpacity: {
    backgroundColor: "#0077B6",
  },
  secondTouchableOpacity: {
    backgroundColor: "#00B4D8",
  },
  thirdTouchableOpacity: {
    backgroundColor: "#64B5F6",
  },
});

export default HomeScreen;
