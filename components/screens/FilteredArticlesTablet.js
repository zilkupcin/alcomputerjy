import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform
} from "react-native";
import Header from "../headers/Header";
import LoadingIndicator from "../indicators/LoadingIndicator";
import { parseArticles } from "../../utils/jsonUtils";
import Error from "../error/Error";
import NetInfo from "@react-native-community/netinfo";
import TwoPane from "../layouts/TwoPane";
import {
  getWindowHeightIos,
  getWindowHeightAndroid
} from "../../utils/dimensUtils";
import {
  getNewArticles,
  setNewArticles,
  getNotificationsPermissionsPrompted,
  setNotificationsPermissionsPrompted
} from "../../utils/storageUtils";
import {
  fetchArticlesByTag,
  fetchArticleImages,
  fetchArticlesByCategory
} from "../../api/wordpress";
import * as Permissions from "expo-permissions";

const FilteredArticlesTablet = ({ navigation }) => {
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

    if (isConnected) {
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
      } else {
        setNotificationsEnabled(true);
        setNotificationsPromted(true);
      }
    } catch (e) {}
  };

  const fetchArticles = async () => {
    try {
      await checkPermissions();

      if (selectedFilter.type === "new") {
        const newArticles = await getNewArticles();
        setArticles(newArticles);

        if (!selectedArticle) {
          setSelectedArticle(newArticles[0]);
        }

        //Clear new articles storage, because user viewed them
        setNewArticles([], true);
      } else if (selectedFilter.type === "tag") {
        const data = await fetchArticlesByTag(currentPage, selectedFilter.id);
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
      } else if (selectedFilter.type === "category") {
        const data = await fetchArticlesByCategory(
          currentPage,
          selectedFilter.id
        );
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
      }
      setFetchingMore(false);
      setIsLoading(false);
    } catch (e) {
      setError(e.message);
    }
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

  const handleArticlePress = article => {
    setSelectedArticle(article);
  };

  const handleFilterSelect = filter => {
    const shouldAllowFilterChange =
      filter.type !== selectedFilter.type ||
      filter.id !== selectedFilter.id ||
      filter.name !== selectedFilter.name;

    if (shouldAllowFilterChange) {
      setSelectedFilter(filter);
    }
  };

  const getArticleHeaderText = () => {
    if (selectedFilter.type === "new") {
      return "مقالات جديدة";
    } else {
      return selectedFilter.name;
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

  const handleLayoutChange = () => {
    const screenHeight = Dimensions.get("screen").height;
    const screenWidth = Dimensions.get("screen").width;

    const windowHeight = Dimensions.get("window").height;
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
      <View style={{ height, width }} onLayout={handleLayoutChange}>
        <Header hasParent={true} onBackPress={handleBackPress} />
        <Error message={message} />
      </View>
    );
  }

  // If something's still loading, show a loading indicator
  if (isLoading) {
    return (
      <View style={{ height, width }} onLayout={handleLayoutChange}>
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
    </View>
  );
};

FilteredArticlesTablet.navigationOptions = ({ navigation }) => ({
  header: null
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff"
  }
});

export default FilteredArticlesTablet;
