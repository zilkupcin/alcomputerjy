import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { fromLeft } from "react-navigation-transitions";
import { createStackNavigator } from "react-navigation-stack";
import Home from "./components/screens/Home";
import FilteredArticles from "./components/screens/FilteredArticles";
import FilteredArticlesTablet from "./components/screens/FilteredArticlesTablet";
import ArticleDetails from "./components/screens/ArticleDetails";
import { I18nManager } from "react-native";
import { Updates } from "expo";


const AppStack = createStackNavigator(
  {
    Home: Home,
    FilteredArticles: FilteredArticles,
    FilteredArticlesTablet: FilteredArticlesTablet,
    ArticleDetails: ArticleDetails
  },
  {
    transitionConfig: () => fromLeft()
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      App: AppStack
    },
    {
      initialRouteName: "App",
      transitionConfig: () => fromLeft()
    }
  )
);
