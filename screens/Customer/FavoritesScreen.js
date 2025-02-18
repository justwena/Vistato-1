import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import firebase from "../../firebase";

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

const FavoritesScreen = ({ navigation }) => {
  const [favoriteFacilities, setFavoriteFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFavoriteFacilities = async () => {
    const user = firebase.auth().currentUser;

    if (!user) {
      return;
    }

    try {
      const favoritesRef = firebase.database().ref(`favorites/${user.uid}`);
      const snapshot = await favoritesRef.once("value");
      const favoriteFacilitiesData = snapshot.val();

      if (favoriteFacilitiesData) {
        const favoriteFacilitiesArray = await Promise.all(
          Object.entries(favoriteFacilitiesData).map(
            async ([id, facilityData]) => {
              try {
                const affiliateSnapshot = await firebase
                  .database()
                  .ref(`affiliates/${facilityData.affiliateId}`)
                  .once("value");
                const affiliateData = affiliateSnapshot.val();

                return {
                  id,
                  ...facilityData,
                  affiliateUsername: affiliateData
                    ? affiliateData.username
                    : "Unknown",
                };
              } catch (error) {
                console.error("Error fetching affiliate data:", error);
                return {
                  id,
                  ...facilityData,
                  affiliateUsername: "Unknown",
                };
              }
            },
          ),
        );

        setFavoriteFacilities(favoriteFacilitiesArray);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorite facilities:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteFacilities();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoriteFacilities();
    }, []),
  );

  const handleItemPress = (facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const handleAddPress = () => {
    navigation.navigate("Home");
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleUntogglePress = async () => {
    const user = firebase.auth().currentUser;

    if (!user || !selectedFacility) {
      return;
    }

    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this facility from favorites?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: async () => {
            try {
              await firebase
                .database()
                .ref(`favorites/${user.uid}/${selectedFacility.id}`)
                .remove();

              const updatedFavoriteFacilities = favoriteFacilities.filter(
                (facility) => facility.id !== selectedFacility.id,
              );
              setFavoriteFacilities(updatedFavoriteFacilities);

              closeModal();
            } catch (error) {
              console.error("Error untoggling favorite:", error);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      fetchFavoriteFacilities();
    } else {
      const filteredFacilities = favoriteFacilities.filter((facility) =>
        facility.facilityName.toLowerCase().includes(text.toLowerCase()),
      );
      setFavoriteFacilities(filteredFacilities);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <CustomHeader title="Saved" onAddPress={handleAddPress} />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#088B9C" />
          </View>
        ) : favoriteFacilities.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              style={styles.affiliateContainer}
              data={favoriteFacilities}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.facilityItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.facilityInfo}>
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.facilityImage}
                    />
                    <View>
                      <Text style={styles.facilityName}>
                        {item.facilityName}
                      </Text>
                      <Text style={styles.affiliateUsername}>
                        {item.affiliateUsername}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color="black" />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          </View>
        ) : (
          <View style={styles.centeredMessageContainer}>
            <Ionicons name="warning" size={50} color="#FF6347" />
            <Text>No saved facilities found.</Text>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.heading}>
                  {selectedFacility?.facilityName || ""}
                </Text>
                <Text style={styles.affiliateUsername}>
                  {selectedFacility?.affiliateUsername || ""}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close-outline" size={18} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {selectedFacility && (
                <View style={styles.facilityDetailsContainer}>
                  <Image
                    source={{ uri: selectedFacility.images[0] }}
                    style={styles.facilityImageModal}
                  />
                  <Text style={styles.amenitiesTitle}>Description:</Text>
                  <Text style={styles.description}>
                    {selectedFacility.description}
                  </Text>
                  <Text style={styles.amenitiesTitle}>Amenities:</Text>
                  <View style={styles.amenitiesContainer}>
                    {selectedFacility.amenities
                      .split("\n")
                      .map((amenity, index) => (
                        <View key={index} style={styles.amenity}>
                          <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                      ))}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabelText}>Price starts at</Text>
                    <Text style={styles.priceValueText}>
                      ₱ {selectedFacility.dayTourPrice.price}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleUntogglePress}
                  >
                    <View style={styles.favoriteButtonContainer}>
                      <Ionicons name="heart" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
  },
  screen: {
    flex: 1,
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
  searchContainer: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  affiliateContainer: {
    padding: 10,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  facilityItem: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  facilityImage: {
    width: 80,
    height: 50,
    marginRight: 15,
    borderRadius: 10,
  },
  facilityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  affiliateUsername: {
    fontSize: 12,
    color: "#666",
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    width: "100%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    paddingBottom: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 5,
  },
  facilityImageModal: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
  facilityDetailsContainer: {
    marginBottom: 10,
  },
  amenitiesTitle: {
    marginBottom: 5,
    color: "#888",
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "justify",
  },
  amenity: {
    backgroundColor: "#088b9c",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 12,
    color: "white",
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  favoriteButton: {
    alignSelf: "flex-end",
    marginTop: -30,
  },
  favoriteButtonContainer: {
    backgroundColor: "#FF6347",
    borderRadius: 20,
    padding: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  priceLabelText: {
    fontSize: 16,
    color: "#333",
  },
  priceValueText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6dc072",
    marginLeft: 5,
  },
});

export default FavoritesScreen;
