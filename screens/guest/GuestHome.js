import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../Customer/HomeScreen"; // Adjusted path to HomeScreen under Customer folder
import firebase from "../../firebase"; // Firebase initialization

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon
const CustomTabBarIcon = ({ route, color, size }) => {
  let iconName;

  if (route.name === "Home") {
    iconName = require("../../assets/icons/home-icon.png"); // Update with your path to home icon
  } else if (route.name === "Favorites") {
    iconName = require("../../assets/icons/favorite-icon.png"); // Update with your path to favorites icon
  } else if (route.name === "Bookings") {
    iconName = require("../../assets/icons/bookings-icon.png"); // Update with your path to bookings icon
  }

  return (
    <View style={styles.tabBarIconContainer}>
      <Image source={iconName} style={{ tintColor: color, width: size, height: size }} />
    </View>
  );
};

const GuestHome = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Update login status based on authentication state
    });

    return unsubscribe; // Clean up the subscription on unmount
  }, []);

  const showLoginAlert = () => {
    Alert.alert(
      "Please log in",
      "You need to log in to access this feature.",
      [
        {
          text: "Log in",
          onPress: () => {
            navigation.navigate("Login"); // Navigate to Login screen
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <CustomTabBarIcon route={route} color={color} size={size} />
          ),
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen} // Home screen for guests
        />
        <Tab.Screen
          name="Favorites"
          component={View}
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault(); // Prevent navigation to Favorites tab
                showLoginAlert(); // Show login prompt
              }
            },
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={View}
          listeners={{
            tabPress: (e) => {
              if (!isLoggedIn) {
                e.preventDefault(); // Prevent navigation to Bookings tab
                showLoginAlert(); // Show login prompt
              }
            },
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarIconContainer: {
    alignItems: "center",
  },
});

export default GuestHome;
