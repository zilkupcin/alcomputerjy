import React from "react";
import { Text, View } from "react-native";

const Error = ({ message }) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text style={{ fontSize: 16 }}>{message}</Text>
    </View>
  );
};

export default Error;
