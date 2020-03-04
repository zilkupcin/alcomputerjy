import React, { useState } from "react";
import * as Font from "expo-font";
import LoadingIndicator from "../indicators/LoadingIndicator";

const FontLoader = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  async function loadFonts() {
    await Font.loadAsync({
      "Almarai-Bold": require("../../assets/fonts/Almarai-Bold.ttf"),
      "Almarai-Regular": require("../../assets/fonts/Almarai-Regular.ttf"),
      "Almarai-Light": require("../../assets/fonts/Almarai-Light.ttf")
    });
    setFontsLoaded(true);
  }

  React.useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingIndicator />;
  }

  return children;
};

export default FontLoader;
