import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import HTML from "react-native-render-html";

const ArticleItem = React.memo(
  ({ onArticlePress, article, selectedArticleId }) => {
    const handleArticlePress = () => {
      onArticlePress(article);
    };

    const getArticleItemStyle = () => {
      let finalStyle = [styles.container];
      let extraStyle = {};

      //If two pane mode, item's size should be bigger
      if (selectedArticleId) {
        extraStyle.maxHeight = 150;
        extraStyle.minHeight = 150;
      }

      //If it's the current selected article, highlight it
      if (selectedArticleId === article.id) {
        extraStyle.backgroundColor = "#fbfbfb";
      }

      finalStyle.push(extraStyle);

      return finalStyle;
    };

    return (
      <TouchableOpacity
        style={getArticleItemStyle()}
        activeOpacity={0.8}
        onPress={handleArticlePress}
      >
        <Image source={article.image !== '' ? { uri: article.image } : require('../assets/article_image_placeholder.png')} style={styles.articleImage} />
        <View style={styles.articleDetails}>
          <HTML
            html={article.title}
            baseFontStyle={styles.articleHeadline}
            ignoredStyles={["fontFamily", "letter-spacing", "text-align"]}
            tagsStyles={{
              p: { textAlign: "left" }
            }}
          />
          <HTML
            html={article.excerpt}
            baseFontStyle={styles.articleSummary}
            ignoredStyles={["fontFamily", "letter-spacing", "text-align"]}
            tagsStyles={{
              p: { textAlign: "left" }
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    padding: 8,
    alignItems: "center",
    maxHeight: 130,
    minHeight: 130,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.41,
    // elevation: 1,

    borderColor: "#ebebeb",
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16

    // borderBottomColor: "#f0f0f0",
    // borderBottomWidth: 1,
    // paddingBottom: 16,
    // paddingTop: 16
  },
  articleImage: {
    width: 72,
    height: 72,
    borderRadius: 4,
    marginRight: 16
  },
  articleDetails: {
    justifyContent: "center",
    width: "100%",
    flex: 1
  },
  articleHeadline: {
    fontFamily: "Almarai-Bold",
    color: "#333",
    fontSize: 16,
    paddingBottom: 16,
    textAlign: 'left'
  },
  articleSummary: {
    fontFamily: "Almarai-Regular",
    color: "#787878"
    // writingDirection: "rtl",
    // textAlign: "left"
  }
});

export default ArticleItem;
