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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase.js";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

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

const FacilityItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.facilityItemContainer}
    onPress={() => onPress(item)}
  >
    <View style={styles.facilityLeft}>
      <Image source={{ uri: item.images[0] }} style={styles.facilityImage} />
      <Text style={styles.facilityName}>{item.facilityName}</Text>
    </View>
    <Ionicons name="chevron-forward" size={15} color="#888" />
  </TouchableOpacity>
);

const FacilityScreen = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchFacilities = async () => {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        console.error("No authenticated user.");
        return;
      }

      const db = firebase.database();
      const facilitiesRef = db.ref("facilities").orderByKey().equalTo(user.uid);

      facilitiesRef.once("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const affiliateFacilities = Object.values(data)[0];
          const fetchedFacilities = Object.keys(affiliateFacilities).map(
            (key) => ({
              id: key,
              ...affiliateFacilities[key],
            }),
          );
          setFacilities(fetchedFacilities);
        } else {
          setFacilities([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching facilities: ", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFacilities();
    }, []),
  );

  const handleAddPress = () => {
    navigation.navigate("AddFacility");
  };

  const handleFacilityPress = (facility) => {
    navigation.navigate("FacilityDetails", { facility: facility });
  };

  return (
    <View style={styles.screen}>
      <CustomHeader title="Facilities" onAddPress={handleAddPress} />

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#088B9C" />
          </View>
        ) : facilities.length > 0 ? (
          <FlatList
            data={facilities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FacilityItem item={item} onPress={handleFacilityPress} />
            )}
          />
        ) : (
          <View style={styles.centeredMessageContainer}>
            <Ionicons name="warning" size={50} color="#FF6347" />
            <Text>No facilities added yet.</Text>
          </View>
        )}
      </View>
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
  facilityImage: {
    width: 80,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FacilityScreen;
