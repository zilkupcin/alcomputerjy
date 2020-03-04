import React, { useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Articles from "../Articles";
import NotificationCta from "../NotificationCta";
import BottomAd from "../BottomAd";

const SinglePane = React.memo(
  ({
    headerText,
    onArticlePress,
    data,
    onListEndReached,
    fetchingMore,
    fetchCalledDuringMomentum,
    setFetchCalledDuringMomentum,
    onEnableNotificationsPress,
    notificationsPrompted
  }) => {

    return (
      <View style={styles.singlePaneContainer}>
        <Articles
          headerText={headerText}
          onArticlePress={onArticlePress}
          data={data}
          onListEndReached={onListEndReached}
          fetchingMore={fetchingMore}
          fetchCalledDuringMomentum={fetchCalledDuringMomentum}
          setFetchCalledDuringMomentum={setFetchCalledDuringMomentum}
        />
        {notificationsPrompted ? <BottomAd/> : <NotificationCta onPress={onEnableNotificationsPress} />}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  singlePaneContainer: {
    flex: 1
  }
});

export default SinglePane;
