import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform
} from "react-native";
import Header from "../headers/Header";
import LoadingIndicator from "../indicators/LoadingIndicator";
import SinglePane from "../layouts/SinglePane";
import TwoPane from "../layouts/TwoPane";
import { fetchAllArticles, fetchArticleImages } from "../../api/wordpress";
import { parseArticles } from "../../utils/jsonUtils";
import * as Font from "expo-font";
import {
  getLastActive,
  setLastActive,
  setNewArticles,
  getNewArticles,
  increaseArticlesViewedCount,
  resetArticlesViewedCount,
  getNotificationsPermissionsPrompted,
  setNotificationsPermissionsPrompted
} from "../../utils/storageUtils";
import NetInfo from "@react-native-community/netinfo";
import Error from "../error/Error";
import * as Permissions from "expo-permissions";
import { Notifications } from "expo";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Device from "expo-device";
import { AdMobInterstitial } from "expo-ads-admob";
import { ARTICLE_VIEWS_TO_SHOW_AD } from "../../constants";
import {
  getWindowHeightIos,
  getWindowHeightAndroid
} from "../../utils/dimensUtils";

const NEW_ARTICLES_TASK = "background-new-articles-task";

const Home = React.memo(({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(true);
  const [articles, setArticles] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [fetchCalledDuringMomentum, setFetchCalledDuringMomentum] = useState(
    false
  );
  const [error, setError] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsPrompted, setNotificationsPromted] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState();

  const [width, setWidth] = useState(Dimensions.get("window").width);
  const [height, setHeight] = useState(
    Platform.OS === "ios" ? getWindowHeightIos() : getWindowHeightAndroid()
  );
  const [twoPaneMode, setTwoPaneMode] = useState(false);

  useEffect(() => {
    // Set Ad Unit for interstitial ads
    AdMobInterstitial.setAdUnitID("");

    checkConnection();

    // Subscribe to network state events
    const netInfoUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected !== isConnected) {
        setIsConnected(state.isConnected);
      }
    });

    // Subscribe to will focus event
    const willFocusSubscription = navigation.addListener(
      "willFocus",
      async () => {
        const newArticles = await getNewArticles();
        setNotificationCount(newArticles.length);
      }
    );

    return () => {
      netInfoUnsubscribe();
      willFocusSubscription.remove();
    };
  }, [currentPage]);

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
      } else {
        setNotificationsEnabled(true);
        setNotificationsPromted(true);
      }

      await setUpBackgroundFetch(false);
    } catch (e) {}
  };

  const setUpBackgroundFetch = async shouldRestart => {
    try {
      if (shouldRestart) {
        await BackgroundFetch.unregisterTaskAsync(NEW_ARTICLES_TASK);
      }

      const result = await BackgroundFetch.getStatusAsync();

      const backgroundFetchAvailable =
        result === BackgroundFetch.Status.Available;
      const isTaskStarted = await TaskManager.isTaskRegisteredAsync(
        NEW_ARTICLES_TASK
      );

      if (backgroundFetchAvailable && !isTaskStarted) {
        const taskOptions = {
          minimumInterval: 21600,
          stopOnTerminate: false,
          startOnBoot: true
        };

        await BackgroundFetch.registerTaskAsync(NEW_ARTICLES_TASK, taskOptions);
        await BackgroundFetch.setMinimumIntervalAsync(21600);
      } else {
      }
    } catch (e) {}
  };

  const loadFonts = async () => {
    await Font.loadAsync({
      "Almarai-Bold": require("../../assets/fonts/Almarai-Bold.ttf"),
      "Almarai-Regular": require("../../assets/fonts/Almarai-Regular.ttf"),
      "Almarai-Light": require("../../assets/fonts/Almarai-Light.ttf")
    });
    setFontsLoaded(true);
  };

  const fetchArticles = async () => {
    try {
      const data = await fetchAllArticles(currentPage);
      let fetchedArticles = await data.json();
      fetchedArticles = await fetchArticleImages(fetchedArticles);
      fetchedArticles = parseArticles(fetchedArticles);
      let clonedArticles = [...articles, ...fetchedArticles];

      if (!fontsLoaded) {
        await loadFonts();
      }

      await getNotificationCount();
      await checkPermissions();

      setArticles(clonedArticles);

      if (!selectedArticle) {
        setSelectedArticle(clonedArticles[0]);
      }
      setFetchingMore(false);
      setIsLoading(false);
      logActivity();
    } catch (e) {
      setError(error.message);
    }
  };

  const getNotificationCount = async () => {
    let notificationCount = await getNewArticles();
    notificationCount = notificationCount.length;
    setNotificationCount(notificationCount);
  };

  const storeNewArticles = async () => {
    try {
      // Fetch latest articles from the wordpress site
      const data = await fetchAllArticles(1);
      let fetchedArticles = await data.json();
      fetchedArticles = await fetchArticleImages(fetchedArticles);
      fetchedArticles = parseArticles(fetchedArticles);

      let dateNow = new Date();
      dateNow.setDate(dateNow.getDate() - 180);

      let newArticles = [];

      fetchedArticles.forEach(article => {
        const publishedDate = new Date(article.date);

        // Compare article's publish time with current time
        // Add the article to the new articles array if user hasn't visited the app since it's been published
        if (publishedDate > dateNow) {
          newArticles.push({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            image: article.image,
            content: article.content
          });
        }
      });

      //Reverse articles to show newset ones at the top
      newArticles.reverse();

      //Get already stored articles
      const storedArticles = await getNewArticles();
      const storedArticlesLength = storedArticles.length;

      //Check if stored articles array contains any of the new articles
      //Add new articles to the stored articles array
      newArticles.forEach(article => {
        const matchFound = storedArticles.find(storedArticle => {
          return article.id === storedArticle.id;
        });

        if (!matchFound) storedArticles.unshift(article);
      });

      //If new articles were found and they were not already stored, save them and show a notification
      if (storedArticles.length > storedArticlesLength) {
        await setNewArticles(storedArticles, true);

        const localNotification = {
          title: "Hajjar.Tech",
          body: `حجّار.تك قام بنشر مواضيع جديدة`,
          ios: {
            sound: false
          },
          android: {
            sound: false,
            priority: "high",
            sticky: false,
            vibrate: false
          }
        };

        Notifications.presentLocalNotificationAsync(localNotification);
      }
    } catch (e) {}
  };

  const logActivity = async () => {
    try {
      await setLastActive();
    } catch (e) {}
  };

  const handleListEndReached = () => {
    if (!fetchCalledDuringMomentum && !fetchingMore) {
      setFetchingMore(true);
      setCurrentPage(currentPage + 1);
      setFetchCalledDuringMomentum(true);
    }
  };

  const handleNotificationsPress = () => {
    if (twoPaneMode) {
      navigation.navigate("FilteredArticles", {
        twoPaneMode: twoPaneMode,
        filter: { type: "new", id: null, name: null }
      });
    } else {
      navigation.navigate("FilteredArticles", {
        twoPaneMode: twoPaneMode,
        filter: { type: "new" }
      });
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

  const handleEnableNotificationsPress = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    setNotificationsPermissionsPrompted(true);
    if (status === "granted") {
      setNotificationsEnabled(true);
    }
    setNotificationsPromted(true);
    setUpBackgroundFetch(true);
  };

  const handleFilterSelect = filter => {
    if (twoPaneMode) {
      navigation.navigate("FilteredArticles", {
        twoPaneMode: twoPaneMode,
        filter
      });
    } else {
      navigation.navigate("FilteredArticles", {
        twoPaneMode: twoPaneMode,
        filter
      });
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

  if (!isConnected || error) {
    const message = !isConnected ? "لا يوجد اتصال" : error;
    return (
      <View style={{ width, height }} onLayout={handleLayoutChange}>
        <Header
          onNotificationsPress={handleNotificationsPress}
          notificationCount={notificationCount}
        />
        <Error message={message} />
      </View>
    );
  }

  if (isLoading) return <LoadingIndicator width={width} height={height} />;

  return (
    <View
      style={[styles.container, { width, height }]}
      onLayout={handleLayoutChange}
    >
      <Header
        onNotificationsPress={handleNotificationsPress}
        notificationCount={notificationCount}
      />
      {twoPaneMode ? (
        <TwoPane
          headerText="كل المقالات"
          onArticlePress={handleArticlePress}
          data={articles}
          onListEndReached={handleListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
          onEnableNotificationsPress={handleEnableNotificationsPress}
          selectedArticle={selectedArticle}
          parent="home"
          onFilterSelect={handleFilterSelect}
          notificationsEnabled={notificationsEnabled}
          notificationsPrompted={notificationsPrompted}
        />
      ) : (
        <SinglePane
          headerText="كل المقالات"
          onArticlePress={handleArticlePress}
          data={articles}
          onListEndReached={handleListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
          onEnableNotificationsPress={handleEnableNotificationsPress}
          notificationsEnabled={notificationsEnabled}
          notificationsPrompted={notificationsPrompted}
        />
      )}
    </View>
  );
});

TaskManager.defineTask(NEW_ARTICLES_TASK, async ({ data, error }) => {
  if (error) {
    return BackgroundFetch.Result.Failed;
  }
  if (data) {
    try {
      // Fetch latest articles from the wordpress site
      const data = await fetchAllArticles(1);
      let fetchedArticles = await data.json();
      fetchedArticles = await fetchArticleImages(fetchedArticles);
      fetchedArticles = parseArticles(fetchedArticles);

      let dateNowString = await getLastActive();
      let dateNow = new Date(dateNowString);

      let newArticles = [];

      fetchedArticles.forEach(article => {
        const publishedDate = new Date(article.date);

        // Compare article's publish time with current time
        // Add the article to the new articles array if user hasn't visited the app since it's been published
        if (publishedDate > dateNow) {
          newArticles.push({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            image: article.image,
            content: article.content
          });
        }
      });

      //Reverse articles to show newset ones at the top
      newArticles.reverse();

      //Get already stored articles
      const storedArticles = await getNewArticles();
      const storedArticlesLength = storedArticles.length;

      //Check if stored articles array contains any of the new articles
      //Add new articles to the stored articles array
      newArticles.forEach(article => {
        const matchFound = storedArticles.find(storedArticle => {
          return article.id === storedArticle.id;
        });

        if (!matchFound) storedArticles.unshift(article);
      });

      //If new articles were found and they were not already stored, save them and show a notification
      if (storedArticles.length > storedArticlesLength) {
        await setNewArticles(storedArticles, true);

        const localNotification = {
          title: "Hajjar.Tech",
          body: `حجّار.تك قام بنشر مواضيع جديدة`,
          ios: {
            sound: false
          },
          android: {
            sound: false,
            priority: "high",
            sticky: false,
            vibrate: false
          }
        };

        Notifications.presentLocalNotificationAsync(localNotification);
        return BackgroundFetch.Result.NewData;
      } else {
        return BackgroundFetch.Result.NoData;
      }
    } catch (e) {
      return BackgroundFetch.Result.Failed;
    }
  }
});

Home.navigationOptions = ({ navigation }) => ({
  header: null
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff"
  }
});

export default Home;
