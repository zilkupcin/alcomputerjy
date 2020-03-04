import React from "react";
import { StyleSheet, View } from "react-native";
import Articles from "../Articles";
import NotificationCta from "../NotificationCta";
import ArticleDetails from "../screens/ArticleDetails";
import BottomAd from "../BottomAd";

const TwoPane = ({
  headerText,
  onArticlePress,
  data,
  onListEndReached,
  fetchingMore,
  fetchCalledDuringMomentum,
  setFetchCalledDuringMomentum,
  onEnableNotificationsPress,
  selectedArticle,
  onFilterSelect,
  parent,
  notificationsPrompted
}) => {
  return (
    <View style={styles.twoPaneContainer}>
      <View style={styles.leftPane}>
        <Articles
          headerText={headerText}
          onArticlePress={onArticlePress}
          data={data}
          onListEndReached={onListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
          twoPaneMode={true}
          selectedArticle={selectedArticle}
        />
        {notificationsPrompted ? <BottomAd/> : <NotificationCta onPress={onEnableNotificationsPress} />}
      </View>
      <ArticleDetails
        selectedArticle={selectedArticle}
        twoPaneMode={true}
        onFilterSelect={onFilterSelect}
        parent={parent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  twoPaneContainer: {
    flex: 1,
    flexDirection: "row"
  },
  leftPane: {
    width: 320
  }
});

export default TwoPane;
