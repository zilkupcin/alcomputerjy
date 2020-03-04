import { AsyncStorage } from "react-native";

export const setLastActive = async () => {
  let dateNow = new Date().toLocaleString("en-US", {
    timeZone: "Europe/London"
  });
  dateNow = new Date(dateNow);
  await AsyncStorage.setItem("lastActive", dateNow.toString());
};

export const getLastActive = async () => {
  let lastActive = await AsyncStorage.getItem("lastActive");

  if (!lastActive) {
    lastActive = new Date().toString();
    await AsyncStorage.setItem("lastActive", lastActive);
  }

  return lastActive;
};

export const setNewArticles = async (newArticles, clearExisting) => {
  if (clearExisting) {
    await AsyncStorage.setItem("newArticles", JSON.stringify([]));
  }

  let storedArticles = await AsyncStorage.getItem("newArticles");

  if (!storedArticles) {
    storedArticles = [];
  } else {
    storedArticles = JSON.parse(storedArticles);
  }

  storedArticles.unshift(...newArticles);

  await AsyncStorage.setItem("newArticles", JSON.stringify(storedArticles));
};

export const getNewArticles = async () => {
  let newArticles = await AsyncStorage.getItem("newArticles");

  if (!newArticles) {
    newArticles = [];
  } else {
    newArticles = JSON.parse(newArticles);
  }

  return newArticles;
};

export const increaseArticlesViewedCount = async () => {
  let articlesViewedCount = await AsyncStorage.getItem("articlesViewedCount");

  if (!articlesViewedCount) {
    articlesViewedCount = 0;
  } else {
    articlesViewedCount = JSON.parse(articlesViewedCount);
  }

  articlesViewedCount = articlesViewedCount + 1;

  await AsyncStorage.setItem(
    "articlesViewedCount",
    JSON.stringify(articlesViewedCount)
  );

  return articlesViewedCount;
};

export const resetArticlesViewedCount = async () => {
  await AsyncStorage.setItem("articlesViewedCount", JSON.stringify(0));
};

export const getNotificationsPermissionsPrompted = async () =>{
  let notificationsPermissionsPrompted = await AsyncStorage.getItem('notificationsPermissionsPrompted');
  notificationsPermissionsPrompted = JSON.parse(notificationsPermissionsPrompted);

  if (notificationsPermissionsPrompted !== false && notificationsPermissionsPrompted !== true){
    notificationsPermissionsPrompted = false;
    await AsyncStorage.setItem('notificationsPermissionsPrompted', JSON.stringify(notificationsPermissionsPrompted));
  }

  return notificationsPermissionsPrompted;
}

export const setNotificationsPermissionsPrompted = async (value) => {
  await AsyncStorage.setItem('notificationsPermissionsPrompted', JSON.stringify(value));
}
