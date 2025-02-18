import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import firebase from "../../firebase";

const HeaderComponent = ({ onBackPress, username, onEditProfilePress }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor="white" />
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.headerIcon}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{username}</Text>
      </View>
      <TouchableOpacity onPress={onEditProfilePress} style={styles.editIcon}>
        <Ionicons name="create" size={24} color="black" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [affiliateData, setAffiliateData] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const affiliateSnapshot = await firebase
            .database()
            .ref(`affiliates/${user.uid}`)
            .once("value");
          const affiliateID = affiliateSnapshot.key;
          const affiliateData = affiliateSnapshot.val();
          const dataWithID = { ...affiliateData, id: affiliateID };
          setAffiliateData(dataWithID);
          console.log("Affiliate Data:", dataWithID);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching affiliate data:", error);
          setLoading(false);
        }
      }
    };

    fetchAffiliateData();
  }, [isFocused]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await firebase.auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handlePaymentDetails = () => {
    navigation.navigate("PaymentDetails");
  };

  const handleSalesReport = () => {
    if (affiliateData && affiliateData.id) {
      navigation.navigate("SalesReport", { affiliateID: affiliateData.id });
    } else {
      console.warn("Affiliate ID is not available");
    }
  };

  const handleAffiliateSubscription = () => {
    navigation.navigate("AffiliateSubscription");
  };

  const handleAffiliateLogs = () => {
    navigation.navigate("AffiliateLogs");
  };

  const handleAddFacility = () => {
    navigation.navigate("AddFacility");
  };

  return (
    <View style={styles.screen}>
      {affiliateData && affiliateData.username && (
        <HeaderComponent
          onBackPress={() => navigation.goBack()}
          username={affiliateData.username}
          onEditProfilePress={handleEditProfile}
        />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#088B9C" />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={true}
        >
          <View style={styles.profileContainer}>
            <Image
              source={require("../../assets/default-cover.jpg")}
              style={styles.coverPhoto}
            />
            <View style={styles.profilePictureContainer}>
              <Image
                source={
                  affiliateData?.profilePicture
                    ? { uri: affiliateData.profilePicture }
                    : require("../../assets/profile-picture.jpg")
                }
                style={styles.profilePicture}
              />
              <Text style={styles.usernameText}>{affiliateData?.username}</Text>

              {affiliateData ? (
                <View style={styles.affiliateDataContainer}>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="mail"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{affiliateData.email || "Not available"}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="call"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{affiliateData.contactNo || "Not available"}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="location"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{affiliateData.address || "Not available"}</Text>
                  </View>
                </View>
              ) : (
                <Text>No affiliate data available</Text>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addFacilityButton}
                  onPress={handleAddFacility}
                >
                  <Ionicons name="add" size={23} color="white" />
                  <Text style={styles.buttonText}> Add Facility</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={handleEditProfile}
                >
                  <Image
                    source={require("../../assets/icons/edit-icon.png")}
                    style={{
                      width: 25,
                      height: 25,
                      marginRight: 8,
                      tintColor: "#5a5a5a",
                      resizeMode: "contain",
                    }}
                  />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            <OptionWithIcon
              iconSource={require("../../assets/icons/sales-icon.png")}
              optionName="Sales Report"
              onPress={handleSalesReport}
            />
            <OptionWithIcon
              iconSource={require("../../assets/icons/payment-icon.png")}
              optionName="Payment Details"
              onPress={handlePaymentDetails}
            />
            <OptionWithIcon
              iconSource={require("../../assets/icons/subscription-icon.png")}
              optionName="Subscription"
              onPress={handleAffiliateSubscription}
            />
            <OptionWithIcon
              iconSource={require("../../assets/icons/logs-icon.png")}
              optionName="Logs"
              onPress={handleAffiliateLogs}
            />
          </View>

          <View style={styles.logoutButtonContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#494c51" />
              ) : (
                <Text style={styles.logoutButtonText}>Log out</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const OptionWithIcon = ({ iconSource, optionName, onPress }) => (
  <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Image source={iconSource} style={styles.iconImage} />
    </View>
    <Text style={styles.optionText}>{optionName}</Text>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={20} color="black" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "white",
  },
  container: {
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
  username: {
    fontSize: 16,
  },
  screen: {
    flex: 1,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingBottom: 10,
  },
  coverPhoto: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  profilePictureContainer: {
    marginTop: -100,
    zIndex: 1,
  },
  profilePicture: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: "white",
    left: 15,
  },
  usernameText: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    left: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingVertical: 0,
  },
  editProfileButton: {
    backgroundColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
    width: "48%",
  },
  addFacilityButton: {
    backgroundColor: "#088B9C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    width: "48%",
  },
  editButtonText: {
    color: "#5a5a5a",
    fontSize: 15,
    textAlign: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  affiliateDataContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  optionsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    marginTop: 5,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  iconContainer: {
    marginRight: 15,
  },
  iconImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  arrowContainer: {
    marginLeft: 10,
  },
  logoutButtonContainer: {
    alignItems: "center",
    padding: 10,
  },
  logoutButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderRadius: 5,
    width: "100%",
  },
  logoutButtonText: {
    color: "#494c51",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
