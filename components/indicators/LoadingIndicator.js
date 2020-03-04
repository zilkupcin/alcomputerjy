import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const LoadingIndicator = ({ height, width }) => {
  return (
    <View
      style={
        height
          ? [{ height, width, alignItems: "center", justifyContent: "center" }]
          : styles.container
      }
    >
      <ActivityIndicator size="large" color="#C32026" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default LoadingIndicator;
