import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator
} from "react-native";
import ArticleItem from "./ArticleItem";
import ArticleListHeader from "./article-list/ArticleListHeader";

const Articles = React.memo(
  ({
    onArticlePress,
    data,
    onListEndReached,
    fetchingMore,
    setFetchCalledDuringMomentum,
    headerText,
    twoPaneMode,
    selectedArticle
  }) => {
    const getArticleItemType = item => {
      return (
        <ArticleItem
          article={item}
          onArticlePress={onArticlePress}
          selectedArticleId={selectedArticle && selectedArticle.id}
        />
      );
    };

    return (
      <View style={twoPaneMode ? styles.containerTwoPane : styles.container}>
        <FlatList
          ListHeaderComponent={<ArticleListHeader headerText={headerText} />}
          contentContainerStyle={
            data.length === 0
              ? [styles.contentContainer, { flex: 1 }]
              : styles.contentContainer
          }
          data={data}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return getArticleItemType(item);
          }}
          ListEmptyComponent={() => {
            return (
              <View style={styles.noArticlesContainer}>
                <Text style={styles.noArticlesText}>
                  لم يتم العثور على أي مقالة
                </Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={onListEndReached}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => setFetchCalledDuringMomentum(false)}
          ListFooterComponent={() => {
            if (fetchingMore) {
              return <ActivityIndicator size="large" color="#C32026" />;
            } else {
              return null;
            }
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerTwoPane: {
    flex: 1,
    borderRightColor: "#ddd",
    borderRightWidth: 1
  },
  titleContainer: {
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1
  },
  contentContainer: {
    padding: 16
  },
  noArticlesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  noArticlesText: {
    fontFamily: "Almarai-Regular",
    fontSize: 16
  }
});

export default Articles;
