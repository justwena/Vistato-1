import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../../firebase";
import { Picker } from "@react-native-picker/picker";

const SalesReportHeader = ({ onBackPress }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBackPress} style={styles.headerIcon}>
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Sales Report</Text>
  </View>
);

const SalesReportScreen = ({ navigation, route }) => {
  const affiliateID = route.params?.affiliateID;

  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSales, setNoSales] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filteredSalesData, setFilteredSalesData] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchSalesData = async () => {
      try {
        const bookingsSnapshot = await firebase
          .database()
          .ref("bookings")
          .once("value");
        const bookingsData = bookingsSnapshot.val();
        const sales = Object.entries(bookingsData || {}).map(
          async ([key, value]) => {
            if (
              value.affiliateID === affiliateID &&
              ["approved", "checked-in", "checked-out", "completed"].includes(
                value.status,
              )
            ) {
              const { customerID, customerDetails, facilityID, ...rest } =
                value;
              const { customerData, facilityData } =
                await fetchCustomerAndFacilityData(
                  customerID,
                  customerDetails,
                  facilityID,
                );
              return { ...rest, customerData, facilityData, id: key };
            }
            return null;
          },
        );
        const resolvedSales = await Promise.all(sales);
        const filteredSales = resolvedSales.filter((sale) => sale !== null);
        setSalesData(filteredSales);
        setLoading(false);

        if (filteredSales.length === 0) {
          setNoSales(true);
        } else {
          setNoSales(false);
          const total = filteredSales.reduce(
            (acc, sale) => acc + parseFloat(sale.amountPaid || 0),
            0,
          );
          setTotalSales(total);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [affiliateID]);

  useEffect(() => {
    const filteredData = salesData.filter((sale) => {
      const date = new Date(sale.checkInDate);
      const saleMonth = date.getMonth() + 1;
      const saleYear = date.getFullYear();
      return saleMonth === selectedMonth && saleYear === selectedYear;
    });
    setFilteredSalesData(filteredData);

    const total = filteredData.reduce(
      (acc, sale) => acc + parseFloat(sale.amountPaid || 0),
      0,
    );
    setTotalSales(total);
  }, [salesData, selectedMonth, selectedYear]);

  const fetchCustomerAndFacilityData = async (
    customerID,
    customerDetails,
    facilityID,
  ) => {
    try {
      let customerData = {};
      if (customerID) {
        const customerSnapshot = await firebase
          .database()
          .ref(`customers/${customerID}`)
          .once("value");
        customerData = customerSnapshot.val() || { username: "Unknown" };
      } else if (customerDetails) {
        customerData = customerDetails;
      } else {
        customerData = { username: "Unknown" };
      }

      const facilitySnapshot = await firebase
        .database()
        .ref(`facilities/${affiliateID}/${facilityID}`)
        .once("value");
      const facilityData = facilitySnapshot.val() || {
        facilityName: "Unknown",
      };

      return { customerData, facilityData };
    } catch (error) {
      console.error("Error fetching customer and facility data:", error);
      return {
        customerData: { username: "Error" },
        facilityData: { facilityName: "Error" },
      };
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateAmountPaid = (saleId, newAmount) => {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error("No authenticated user.");
      return;
    }

    const saleRef = firebase.database().ref(`bookings/${saleId}`);

    saleRef
      .update({ amountPaid: newAmount })
      .then(() => {
        console.log("Amount updated successfully.");
        const updatedSalesData = salesData.map((sale) => {
          if (sale.id === saleId) {
            return { ...sale, amountPaid: newAmount };
          }
          return sale;
        });
        setSalesData(updatedSalesData);
      })
      .catch((error) => {
        console.error("Error updating amount:", error);
      });
  };

  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");

  const startEditingAmount = (saleId, initialAmount) => {
    setEditingSaleId(saleId);
    setEditedAmount(initialAmount.toString());
  };

  const saveEditedAmount = (saleId, originalAmount) => {
    const newAmount = parseFloat(editedAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      setEditedAmount(originalAmount.toString());
    } else if (editedAmount === "") {
      Alert.alert("Empty Amount", "Please enter a non-empty amount.");
    } else {
      updateAmountPaid(saleId, newAmount);
      setEditingSaleId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SalesReportHeader onBackPress={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#088B9C" />
        </View>
      ) : (
        <>
          <ScrollView>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={selectedMonth}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedMonth(itemValue)
                }
              >
                <Picker.Item label="January" value={1} />
                <Picker.Item label="February" value={2} />
                <Picker.Item label="March" value={3} />
                <Picker.Item label="April" value={4} />
                <Picker.Item label="May" value={5} />
                <Picker.Item label="June" value={6} />
                <Picker.Item label="July" value={7} />
                <Picker.Item label="August" value={8} />
                <Picker.Item label="September" value={9} />
                <Picker.Item label="October" value={10} />
                <Picker.Item label="November" value={11} />
                <Picker.Item label="December" value={12} />
              </Picker>
              <Picker
                style={styles.picker}
                selectedValue={selectedYear}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedYear(itemValue)
                }
              >
                <Picker.Item label="2022" value={2022} />
                <Picker.Item label="2023" value={2023} />
                <Picker.Item label="2024" value={2024} />
                <Picker.Item label="2025" value={2025} />
                <Picker.Item label="2026" value={2026} />
                <Picker.Item label="2027" value={2027} />
                <Picker.Item label="2028" value={2028} />
                <Picker.Item label="2029" value={2029} />
                <Picker.Item label="2030" value={2030} />
              </Picker>
            </View>

            <View style={styles.totalSalesWrapper}>
              <View style={styles.totalSalesContainer}>
                <View>
                  <Text style={styles.totalSalesText}>₱ {totalSales}</Text>
                  <Text style={styles.totalSalesLabelText}>Total Sales</Text>
                </View>
                <View style={styles.billIcon}>
                  <Ionicons name="receipt" size={50} color="#1e90ae" />
                </View>
              </View>
            </View>

            <View style={styles.salesListContainer}>
              {filteredSalesData.map((sale, index) => (
                <View key={index} style={styles.saleItem}>
                  <View style={styles.leftColumn}>
                    <Text style={styles.customerName}>
                      {sale.customerData.username}
                    </Text>
                  </View>
                  <View style={styles.rightColumn}>
                    <Text style={styles.facilityName}>
                      {sale.facilityData.facilityName}
                    </Text>
                    <Text style={styles.checkInDate}>
                      {formatDate(sale.checkInDate)}
                    </Text>
                    {editingSaleId === sale.id ? (
                      <TextInput
                        style={styles.amountPaidInput}
                        value={editedAmount}
                        keyboardType="numeric"
                        onChangeText={setEditedAmount}
                        onBlur={() =>
                          saveEditedAmount(sale.id, sale.amountPaid)
                        }
                        autoFocus={true}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          startEditingAmount(sale.id, sale.amountPaid)
                        }
                      >
                        <Text style={styles.amountPaidText}>
                          ₱ {sale.amountPaid}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  headerTitle: {
    color: "black",
    fontSize: 16,
    marginLeft: 10,
  },
  headerIcon: {
    position: "absolute",
    left: 15,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 10,
  },
  totalSalesWrapper: {
    paddingHorizontal: 10,
  },
  totalSalesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#2ba6c7",
    borderRadius: 20,
    alignItems: "center",
  },
  totalSalesText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  totalSalesLabelText: {
    fontSize: 14,
    color: "white",
  },
  billIcon: {
    fontSize: 24,
    color: "white",
  },
  salesListContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  saleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  customerName: {
    fontSize: 15,
  },
  facilityName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  checkInDate: {
    fontSize: 13,
    color: "#888",
  },
  amountPaidText: {
    fontSize: 13,
    color: "#6dc072",
    paddingTop: 5,
  },
  amountPaidInput: {
    fontSize: 13,
    color: "#888",
    width: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SalesReportScreen;
