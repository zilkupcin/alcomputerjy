import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const ArticleTag = ({ tag, onTagPress }) => {
  const handleTagPress = () => {
    onTagPress(tag);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.4}
      onPress={handleTagPress}
    >
      <Text style={styles.tagName}>{tag.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderWidth: 1,
    color: "#C32026",
    borderColor: "#C32026",
    marginRight: 8,
    marginBottom: 8
  },
  tagName: {
    fontFamily: "Almarai-Regular",
    color: "#C32026"
  }
});

export default ArticleTag;
