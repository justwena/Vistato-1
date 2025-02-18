import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
} from "react-native";
import { CommonActions } from "@react-navigation/native";

// Functional component for displaying the logo at the top of the screen.
const LogoContainer = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("../assets/vista-logo.png")} // Path to the logo image.
        style={styles.logo} // Styling for the logo image.
      />
    </View>
  );
};

// Functional component for displaying the main welcoming text.
const MainTextContainer = () => {
  return (
    <View style={styles.mainTextContainer}>
      <Text style={styles.mainText}>
        Find your{"\n"} 
        Haven{"\n"}
        with{"\n"}
        Vista 360
      </Text>
    </View>
  );
};

// Functional component for displaying a subtext below the main text.
const SubTextContainer = () => {
  return (
    <View style={styles.subTextContainer}>
      <Text style={styles.subText}>
        Explore, Book{"\n"} 
        and Experience.
      </Text>
    </View>
  );
};

// Functional component for the "Explore Now" button, which navigates to the GuestHome screen.
const ExploreButtonContainer = ({ navigation }) => {
  const navigateToGuestHome = () => {
    navigation.navigate("GuestHome"); // Navigates to the GuestHome screen when the button is pressed.
  };

  return (
    <View style={styles.exploreButtonContainer}>
      <TouchableOpacity style={styles.exploreButton} onPress={navigateToGuestHome}>
        <Text style={styles.buttonText}>Explore Now</Text> 
      </TouchableOpacity>
    </View>
  );
};

// Functional component for the "Login" message and button. Redirects to the login screen.
const LoginMessageContainer = ({ navigation }) => {
  const navigateToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Login", // Resets navigation stack and navigates to the Login screen.
          },
        ],
      })
    );
  };

  return (
    <View style={styles.loginMessageContainer}>
      <Text style={styles.loginMessage}>
        Already have an account?{" "}
        
        <Text style={styles.signInText} onPress={navigateToLogin}>
         Log in
        </Text>
      </Text>
    </View>
  );
};

// Main component for the Welcome Screen.
const WelcomeScreen = ({ navigation }) => {
  const navigateToAdminRegistration = () => {
    navigation.navigate("AdminRegistration"); // Navigates to the AdminRegistration screen.
  };

  return (
    <ImageBackground
      source={require("../assets/loginpic.jpg")} // Background image for the screen.
      style={styles.backgroundImage}
    >
    
      <StatusBar barStyle="light-content" backgroundColor="#095e69" /> 

      <View style={styles.container}>
        {/* Components displayed on the welcome screen */}
        <LogoContainer onPress={navigateToAdminRegistration} /> 
        <MainTextContainer /> 
        <ExploreButtonContainer navigation={navigation} />
        <LoginMessageContainer navigation={navigation} /> 
      </View>
    </ImageBackground>
  );
};

// Styles for the components.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centers components vertically.
    alignItems: "center", // Centers components horizontally.
    paddingHorizontal: 20,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Ensures the background image covers the entire screen.
    justifyContent: "center",
  },
  logoContainer: {
    position: "absolute",
    top: 40, // Positions the logo near the top of the screen.
  },
  logo: {
    width: 240, // Width of the logo.
    height: 160, // Height of the logo.
  },
  mainTextContainer: {
    position: "absolute",
    left: 25,
    top: 220, // Positioning for the main text.
  },
  mainText: {
    fontSize: 40, // Large font size for emphasis.
    fontWeight: "bold",
    color: "#67ac8e", // Greenish text color.
    lineHeight: 55, // Space between lines.
    letterSpacing: 0.5, // Slight letter spacing for readability.
  },
  subTextContainer: {
    position: "absolute",
    left: 25,
    top: 460, // Positioning for the subtext.
  },
  subText: {
    fontSize: 16,
    color: "#67ac8e", // Matches the main text color.
    lineHeight: 25,
    letterSpacing: 0.3,
  },
  exploreButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 150, // Positions the Explore button at the bottom with spacing.
  },
  exploreButton: {
    backgroundColor: "#0CB695", // Button color.
    width: 200,
    height: 47,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10, // Rounded corners.
    alignItems: "center",
    justifyContent: "center",
    top: 130, // Adjusts button position relative to the container.
  },
  buttonText: {
    color: "white", // White button text.
    fontSize: 20,
    letterSpacing: 0.3,
  },
  loginMessageContainer: {
    marginBottom: 50, // Spacing below the login message.
  },
  loginMessage: {
    fontSize: 14, // Small font size for the message.
    color: "#262626", // Darker text color.
    letterSpacing: 0.3,
  },
  signInText: {
    color: "#67ac8e", // Greenish color for the "Login" link.
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default WelcomeScreen; // Exports the WelcomeScreen component for use in the app.
