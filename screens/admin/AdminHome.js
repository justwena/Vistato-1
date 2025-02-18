import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./HomeScreen";
import AffiliateScreen from "./AffiliateScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({ route, color, size }) => {
  let iconName;

  if (route.name === "Home") {
    iconName = require("../../assets/icons/home-icon.png");
  } else if (route.name === "Affiliates") {
    iconName = require("../../assets/icons/affiliates-icon.png");
  } else if (route.name === "Profile") {
    iconName = require("../../assets/icons/profile-icon.png");
  }

  return (
    <View style={styles.tabBarIconContainer}>
      <View style={styles.iconContainer}>
        <Image
          source={iconName}
          style={{ tintColor: color, width: size, height: size }}
        />
      </View>
      <Text style={{ color, fontSize: 10, textAlign: "center" }}>
        {route.name}
      </Text>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityStates={isFocused ? ["selected"] : []}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            <CustomTabBarIcon
              route={route}
              color={isFocused ? "#088B9C" : "gray"}
              size={24}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const AdminHome = () => (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
  >
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Affiliates"
        component={AffiliateScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarIconContainer: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: "space-around",
    borderTopColor: "#f1f1f1",
    borderTopWidth: 1,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
  },
});

export default AdminHome;
