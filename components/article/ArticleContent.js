import React from "react";
import { Dimensions } from "react-native";
import HTML from "react-native-render-html";
import { Linking } from "expo";

const ArticleContent = ({ content, twoPaneMode }) => {
  const handleLinkPress = (event, href) => {
    Linking.openURL(href);
  };

  const calculateMaxImageWidth = () => {
    const screenWidth = Dimensions.get("window").width;

    if (twoPaneMode) {
      // Subtract the width of the 1st pane and all margins and paddings
      return screenWidth - 385;
    } else {
      return screenWidth - 32;
    }
  };

  return (
    <HTML
      html={content}
      imagesMaxWidth={calculateMaxImageWidth()}
      baseFontStyle={{
        fontFamily: "Almarai-Regular",
        fontSize: 16,
        lineHeight: 24
      }}
      ignoredStyles={[
        "fontFamily",
        "letter-spacing",
        "width",
        "height",
        "text-align"
      ]}
      tagsStyles={{
        a: { color: "#C32026" },
        figure: { width: "100%" },
        img: { width: "100%", alignSelf: "center" },
        p: styles.paragraphStyleRegular,
        span: { textAlign: "left" },
        h1: styles.paragraphStyleBold,
        h2: styles.paragraphStyleBold,
        h3: styles.paragraphStyleBold,
        h4: styles.paragraphStyleBold,
        h5: styles.paragraphStyleBold,
        h6: styles.paragraphStyleBold,
        iframe: {
          width: calculateMaxImageWidth(),
          maxWidth: calculateMaxImageWidth()
        },
        strong: {
          fontWeight: "normal",
          fontFamily: "Almarai-Bold",
          lineHeight: 32,
          textAlign: "left"
        }
      }}
      onLinkPress={handleLinkPress}
    />
    // <HTMLView value={content} />
  );
};

const styles = {
  paragraphStyleBold: {
    fontWeight: "normal",
    fontFamily: "Almarai-Bold",
    textAlign: "left",
    marginTop: 16,
    marginBottom: 16
  },
  paragraphStyleRegular: {
    fontFamily: "Almarai-Regular",
    textAlign: "left",
    marginTop: 16,
    marginBottom: 16
  }
};

export default ArticleContent;
