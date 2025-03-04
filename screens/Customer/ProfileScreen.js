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
import firebase from "../../firebase.js";

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

  const [userData, setUserData] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const userSnapshot = await firebase
            .database()
            .ref(`customers/${user.uid}`)
            .once("value");
          const userData = userSnapshot.val();
          setUserData(userData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      }
    };

    fetchUserData();
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
    navigation.navigate("EditCustomerProfile");
  };

  const handleAddBooking = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.screen}>
      {userData && userData.username && (
        <HeaderComponent
          onBackPress={() => navigation.goBack()}
          username={userData.username}
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
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.profileContainer}>
            <Image
              source={require("../../assets/default-cover.jpg")}
              style={styles.coverPhoto}
            />
            <View style={styles.profilePictureContainer}>
              <Image
                source={
                  userData?.profilePicture
                    ? { uri: userData.profilePicture }
                    : require("../../assets/user.png")
                }
                style={styles.profilePicture}
              />
              <Text style={styles.usernameText}>{userData?.username}</Text>

              {userData ? (
                <View style={styles.customerDataContainer}>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="at-outline"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{userData.email || "Not available"}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{userData.contactNo || "Not available"}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#088B9C"
                      style={styles.icon}
                    />
                    <Text>{userData.address || "Not available"}</Text>
                  </View>
                </View>
              ) : (
                <Text>No customer data available</Text>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addBookingButton}
                  onPress={handleAddBooking}
                >
                  <Ionicons name="add" size={23} color="white" />
                  <Text style={styles.buttonText}> Add Booking</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: "white",
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
    left: 15,
    fontWeight: "bold",
    color: "black",
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
  addBookingButton: {
    backgroundColor: "#DF6D14",
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
  customerDataContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
});

export default ProfileScreen;
