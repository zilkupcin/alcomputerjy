import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform
} from "react-native";
import Header from "../headers/Header";
import LoadingIndicator from "../indicators/LoadingIndicator";
import {
  getNewArticles,
  setNewArticles,
  increaseArticlesViewedCount,
  resetArticlesViewedCount,
  getNotificationsPermissionsPrompted,
  setNotificationsPermissionsPrompted
} from "../../utils/storageUtils";
import {
  fetchArticlesByTag,
  fetchArticleImages,
  fetchArticlesByCategory
} from "../../api/wordpress";
import { parseArticles } from "../../utils/jsonUtils";
import Error from "../error/Error";
import NetInfo from "@react-native-community/netinfo";
import TwoPane from "../layouts/TwoPane";
import SinglePane from "../layouts/SinglePane";
import { AdMobInterstitial } from "expo-ads-admob";
import * as Device from "expo-device";
import { ARTICLE_VIEWS_TO_SHOW_AD } from "../../constants";
import {
  getWindowHeightIos,
  getWindowHeightAndroid
} from "../../utils/dimensUtils";
import * as Permissions from "expo-permissions";

const FilteredArticles = ({ navigation }) => {
  const filter = navigation.getParam("filter");

  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilterId, setPreviousFilterId] = useState();
  const [fetchCalledDuringMomentum, setFetchCalledDuringMomentum] = useState(
    false
  );
  const [fetchingMore, setFetchingMore] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsPrompted, setNotificationsPromted] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState();
  const [selectedFilter, setSelectedFilter] = useState({
    type: filter.type,
    id: filter.id,
    name: filter.name
  });
  const [twoPaneMode, setTwoPaneMode] = useState();

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

    //If filter options have changed, load new articles, note the previous filter id
    if (previousFilterId !== selectedFilter.id) {
      setIsLoading(true);
      setPreviousFilterId(selectedFilter.id);
    }

    checkConnection();

    return () => {
      //Unsubscribe from network state
      unsubscribe();
    };
  }, [currentPage, selectedFilter]);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected;
    setIsConnected(isConnected);

    if (isConnected && fetchingMore) {
      fetchArticles();
    }
  };

  const checkPermissions = async () => {
    try {
      const result = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      const promted = await getNotificationsPermissionsPrompted();

      if (result.status !== "granted") {
        setNotificationsEnabled(false);
        setNotificationsPromted(promted);
      }
        else {
        setNotificationsEnabled(true);
        setNotificationsPromted(true);
        }
    } catch (e) {}
  };

  const fetchArticles = async () => {
    try {
      await checkPermissions();

      if (selectedFilter.type === "new") {
        await fetchNewArticles();
      } else {
        await fetchArticlesByFilter();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchNewArticles = async () => {
    const newArticles = await getNewArticles();
    setArticles(newArticles);

    if (!selectedArticle) {
      setSelectedArticle(newArticles[0]);
    }

    //Clear new articles storage, because user viewed them
    setNewArticles([], true);

    //Delay removing loading indicator to prevent stutter due to a quickly completed async function
    setTimeout(() => {
      setFetchingMore(false);
      setIsLoading(false);
    }, 300);
  };

  const fetchArticlesByFilter = async () => {
    let data;

    if (selectedFilter.type === "category") {
      data = await fetchArticlesByCategory(currentPage, selectedFilter.id);
    } else {
      data = await fetchArticlesByTag(currentPage, selectedFilter.id);
    }

    let fetchedArticles = await data.json();
    fetchedArticles = await fetchArticleImages(fetchedArticles);
    fetchedArticles = parseArticles(fetchedArticles);

    let clonedArticles = [];

    //If it's a new search, do not include previous articles
    if (previousFilterId !== selectedFilter.id) {
      clonedArticles = [...fetchedArticles];
    } else {
      clonedArticles = [...articles, ...fetchedArticles];
    }

    setArticles(clonedArticles);
    if (!selectedArticle) {
      setSelectedArticle(clonedArticles[0]);
    }

    setFetchingMore(false);
    setIsLoading(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleListEndReached = () => {
    const lastPage = articles.length % 10 != 0;

    if (
      !fetchCalledDuringMomentum &&
      !lastPage &&
      selectedFilter.type !== "new" &&
      !fetchingMore
    ) {
      setFetchingMore(true);
      setCurrentPage(currentPage + 1);
      setFetchCalledDuringMomentum(true);
    }
  };

  const handleArticlePress = async article => {
    if (twoPaneMode) {
      await logArticleView();
      setSelectedArticle(article);
    } else {
      await logArticleView();
      navigation.navigate("ArticleDetails", { article });
    }
  };

  const handleEnableNotificationsPress = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    setNotificationsPermissionsPrompted(true);
    if (status === "granted") {
      setNotificationsEnabled(true);
    } else {
    }
    setNotificationsPromted(true);
  };

  const logArticleView = async () => {
    const articlesViewed = await increaseArticlesViewedCount();

    //Prepare ad for to display on next article view
    if (articlesViewed === ARTICLE_VIEWS_TO_SHOW_AD - 1) {
      const isAdReady = await AdMobInterstitial.getIsReadyAsync();
      if (!isAdReady) {
        AdMobInterstitial.requestAdAsync();
      }
    }

    // If the user has viewed 5 articles
    if (articlesViewed === ARTICLE_VIEWS_TO_SHOW_AD) {
      const isAdReady = await AdMobInterstitial.getIsReadyAsync();
      if (isAdReady) {
        AdMobInterstitial.showAdAsync();
      } else {
        AdMobInterstitial.requestAdAsync();
      }
      await resetArticlesViewedCount();
    }
  };

  const handleFilterSelect = filter => {
    setFetchingMore(true);
    setSelectedFilter(filter);
  };

  const getArticleHeaderText = () => {
    if (selectedFilter.type === "new") {
      return "مقالات جديدة";
    } else {
      return selectedFilter.name;
    }
  };

  const handleLayoutChange = async () => {
    const screenHeight = Dimensions.get("screen").height;
    const screenWidth = Dimensions.get("screen").width;

    const windowHeight = Dimensions.get("window").height;
    const windowWidth = Dimensions.get("window").width;

    setWidth(windowWidth);

    setHeight(
      Platform.OS === "ios" ? getWindowHeightIos() : getWindowHeightAndroid()
    );

    let type = await Device.getDeviceTypeAsync();
    let orientation;

    if (windowWidth > windowHeight) {
      orientation = "landscape";
    } else {
      orientation = "portrait";
    }

    if (type === Device.DeviceType.PHONE) {
      setTwoPaneMode(false);
    } else {
      const isPortrait = orientation === "portrait";

      if (isPortrait && screenWidth <= 768) {
        setTwoPaneMode(false);
      } else {
        setTwoPaneMode(true);
      }
    }
  };

  // If there's an error or there's not internet connection, show an error component
  if (!isConnected || error) {
    const message = !isConnected ? "لا يوجد اتصال" : error;
    return (
      <View style={{ width, height }} onLayout={handleLayoutChange}>
        <Header hasParent={true} onBackPress={handleBackPress} />
        <Error message={message} />
      </View>
    );
  }

  // If something's still loading, show a loading indicator
  if (isLoading) {
    return (
      <View style={{ width, height }} onLayout={handleLayoutChange}>
        <Header hasParent={true} onBackPress={handleBackPress} />
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { width, height }]}
      onLayout={handleLayoutChange}
    >
      <Header hasParent={true} onBackPress={handleBackPress} />
      {twoPaneMode ? (
        <TwoPane
          headerText={getArticleHeaderText()}
          onArticlePress={handleArticlePress}
          data={articles}
          onListEndReached={handleListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
          selectedArticle={selectedArticle}
          onFilterSelect={handleFilterSelect}
          notificationsEnabled={notificationsEnabled}
          notificationsPrompted={notificationsPrompted}
          onEnableNotificationsPress={handleEnableNotificationsPress}
        />
      ) : (
        <SinglePane
          headerText={getArticleHeaderText()}
          onArticlePress={handleArticlePress}
          data={articles}
          onListEndReached={handleListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
          notificationsEnabled={notificationsEnabled}
          notificationsPrompted={notificationsPrompted}
          onEnableNotificationsPress={handleEnableNotificationsPress}
        />
      )}
    </View>
  );
};

FilteredArticles.navigationOptions = ({ navigation }) => ({
  header: null
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff"
  }
});

export default FilteredArticles;
