import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { AdMobBanner } from "expo-ads-admob";

const ArticleListHeader = React.memo(({ headerText }) => {
  return (
    <View>
      <Text style={styles.title}>{headerText}</Text>
      <AdMobBanner
        style={{ alignSelf: "center", marginBottom: 16 }}
        bannerSize="banner"
        adUnitID=""
      />
    </View>
  );
});

const styles = StyleSheet.create({
  title: {
    color: "#333",
    fontFamily: "Almarai-Bold",
    paddingBottom: 16,
    fontSize: 20,
    textAlign: "left"
  }
});

export default ArticleListHeader;
