import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  Platform
} from "react-native";
import Header from "../headers/Header";
import ArticleHeader from "../article/ArticleHeader";
import ArticleTags from "../article/ArticleTags";
import ArticleContent from "../article/ArticleContent";
import { fetchArticleCategory, fetchArticleTags } from "../../api/wordpress";
import { parseArticleCategory, parseArticleTags } from "../../utils/jsonUtils";
import LoadingIndicator from "../indicators/LoadingIndicator";
import NetInfo from "@react-native-community/netinfo";
import Error from "../error/Error";
import { AdMobBanner } from "expo-ads-admob";
import {
  getWindowHeightIos,
  getWindowHeightAndroid
} from "../../utils/dimensUtils";

const ArticleDetails = ({
  navigation,
  selectedArticle,
  twoPaneMode,
  onFilterSelect,
  parent
}) => {
  const article = twoPaneMode
    ? selectedArticle
    : navigation.getParam("article");

  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  const [width, setWidth] = useState(Dimensions.get("window").width);
  const [height, setHeight] = useState(
    Platform.OS === "ios" ? getWindowHeightIos() : getWindowHeightAndroid()
  );

  useEffect(() => {
    // subscribe to network state
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected !== isConnected) {
        setIsConnected(state.isConnected);
      }
    });

    if (article || selectedArticle) {
      checkConnection();
    } else {
      setIsLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [selectedArticle]);

  const checkConnection = async () => {
    setIsLoading(true);
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected;
    setIsConnected(isConnected);

    if (isConnected) {
      loadArticleInfo();
    }
  };

  const loadArticleInfo = async () => {
    try {
      let [category, tags] = await Promise.all([
        fetchArticleCategory(article.id),
        fetchArticleTags(article.id)
      ]);

      category = parseArticleCategory(category);
      tags = parseArticleTags(tags);

      setTags(tags);
      setCategory(category);

      setIsLoading(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCategoryPress = category => {
    if (twoPaneMode && parent !== "home") {
      onFilterSelect({
        type: "category",
        id: category.id,
        name: category.name
      });
    } else {
      if (navigation) {
        navigation.navigate("FilteredArticles", {
          twoPaneMode: false,
          filter: { type: "category", id: category.id, name: category.name }
        });
      } else {
        onFilterSelect({
          type: "category",
          id: category.id,
          name: category.name
        });
      }
    }
  };

  const handleTagPress = tag => {
    if (twoPaneMode && parent !== "home") {
      onFilterSelect({ type: "tag", id: tag.id, name: tag.name });
    } else {
      if (navigation) {
        navigation.navigate("FilteredArticles", {
          twoPaneMode: false,
          filter: { type: "tag", id: tag.id, name: tag.name }
        });
      } else {
        onFilterSelect({
          type: "tag",
          id: tag.id,
          name: tag.name
        });
      }
    }
  };

  const handleLayoutChange = () => {
    const windowWidth = Dimensions.get("window").width;

    setWidth(windowWidth);

    setHeight(
      Platform.OS === "ios" ? getWindowHeightIos() : getWindowHeightAndroid()
    );
  };

  // If there's an error or there's not internet connection, show an error component
  if (!isConnected || error) {
    const message = !isConnected ? "لا يوجد اتصال" : error;
    return (
      <View style={{ height, width }}>
        {!twoPaneMode && (
          <Header
            hasParent={true}
            onBackPress={handleBackPress}
            onLayout={handleLayoutChange}
          />
        )}
        <Error message={message} />
      </View>
    );
  }

  //Show loading indicator if something's still loading
  if (isLoading) return <LoadingIndicator />;

  //If there's no content to display

  if (!selectedArticle && !article) {
    return (
      <View style={styles.container}>
        {!twoPaneMode && (
          <Header onBackPress={handleBackPress} hasParent={true} />
        )}
        <View style={styles.noContentContainer}>
          <Text style={styles.noContentText}>لم يتم اختيار أي مقالة</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={
        twoPaneMode
          ? styles.container
          : { backgroundColor: "#fff", width, height }
      }
      onLayout={handleLayoutChange}
    >
      {!twoPaneMode && (
        <Header onBackPress={handleBackPress} hasParent={true} />
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ArticleHeader
          image={article.image}
          title={article.title}
          category={category}
          onCategoryPress={handleCategoryPress}
        />
        {!article.hasVideo && <AdMobBanner
          style={{ alignSelf: "center", marginBottom: 8, marginTop: 16 }}
          bannerSize="largeBanner"
          adUnitID=""
        />}
        <ArticleContent content={article.content} twoPaneMode={twoPaneMode} />
        {!article.hasVideo && <AdMobBanner
          style={{ alignSelf: "center", marginBottom: 16 }}
          bannerSize="largeBanner"
          adUnitID=""
        />}
        <ArticleTags tags={tags} onTagPress={handleTagPress} />
      </ScrollView>
    </View>
  );
};

ArticleDetails.navigationOptions = ({ navigation }) => ({
  header: null
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    padding: 16
  },
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  noContentText: {
    fontFamily: "Almarai-Regular",
    fontSize: 16
  }
});

export default ArticleDetails;
