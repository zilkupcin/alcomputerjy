import React from "react";
import { View, StyleSheet } from "react-native";
import { AdMobBanner } from "expo-ads-admob";

const BottomAd = () => {
  return (
    <View style={styles.container}>
      <AdMobBanner
        style={{ alignSelf: "center" }}
        bannerSize="banner"
        adUnitID=""
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
    backgroundColor: "#fff"
  }
});

export default BottomAd;
