import { Dimensions, StatusBar } from "react-native";

export const getWindowHeightAndroid = () => {
  return Dimensions.get("window").height === Dimensions.get("screen").height ||
    Dimensions.get("window").height === Dimensions.get("screen").width
    ? Dimensions.get("window").height - StatusBar.currentHeight
    : Dimensions.get("window").height;
};

export const getWindowHeightIos = () => {
  return Dimensions.get("window").height;
};
