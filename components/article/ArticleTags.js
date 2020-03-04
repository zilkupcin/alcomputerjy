import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import ArticleTag from "./ArticleTag";

const ArticleTags = ({ tags, onTagPress }) => {
  if (tags.length === 0) return null;

  return (
    <View>
      <View style={styles.labelContainer}>
        <Image
          source={require("../../assets/tag.png")}
          style={styles.tagIcon}
        />
        <Text style={styles.label}>كلمات ذات صلة</Text>
      </View>
      <View style={styles.tagContainer}>
        {tags.map((tag, index) => {
          return <ArticleTag tag={tag} key={index} onTagPress={onTagPress} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#C32026",
    padding: 8,
    marginBottom: 16,
    marginTop: 16
  },
  label: {
    fontFamily: "Almarai-Bold",
    color: "#fff"
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  tagIcon: {
    width: 25,
    height: 25,
    marginRight: 8
  }
});

export default ArticleTags;
