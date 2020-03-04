import React from "react";
import { Image, StyleSheet, TouchableOpacity, Text } from "react-native";

const bellIcon = require("../../assets/bell_light.png");

const CtaButton = React.memo(({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={bellIcon}
        style={styles.ctaImage}
      />
      <Text style={styles.ctaText}>تفعيل التنبيهات</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 48,
    width: "100%",
    backgroundColor: "#C32026",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4
  },
  ctaImage: {
    width: 20,
    height: 20
  },
  ctaText: {
    fontFamily: "Almarai-Regular",
    color: "#fff",
    fontSize: 14,
    marginLeft: 8
  }
});

export default CtaButton;
