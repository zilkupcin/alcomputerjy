import React from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import HTML from "react-native-render-html";

const placeholderImage = require('../../assets/article_image_placeholder.png');

const ArticleHeader = ({ image, category, title, onCategoryPress }) => {
  const handleCategoryPress = () => {
    onCategoryPress(category);
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.articleImage}
        source={image !== '' ? { uri: image } : placeholderImage} style={styles.articleImage}
      />
      <View style={styles.articleDetails}>
        <HTML
          html={title}
          baseFontStyle={styles.articleTitle}
          ignoredStyles={["fontFamily", "letter-spacing", "text-align"]}
          tagsStyles={{
            p: { textAlign: "left" }
          }}
        />
        <TouchableOpacity activeOpacity={0.4} onPress={handleCategoryPress}>
          <Text style={styles.articleCategory}>{category.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#DFDFDF"
  },
  articleDetails: {
    flex: 1
  },
  articleTitle: {
    fontFamily: "Almarai-Bold",
    fontSize: 24,
    textAlign: "left"
  },
  articleCategory: {
    fontFamily: "Almarai-Regular",
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderWidth: 1,
    color: "#C32026",
    borderColor: "#C32026",
    marginTop: 8,
    alignSelf: "flex-start"
  },
  articleImage: {
    width: 92,
    height: 92,
    borderRadius: 4,
    marginRight: 16
  }
});

export default ArticleHeader;
