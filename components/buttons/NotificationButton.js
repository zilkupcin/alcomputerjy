import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  notificationCount,
  Platform
} from "react-native";

const bellIcon = equire("../../assets/bell.png");

const NotificationButton = React.memo(({ onPress, notificationCount }) => {

  const ButtonIOS = () => {
    return (
      <TouchableOpacity
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#ddd", true)}
        delayPressIn={0}
      >
        <View>
          <Image
            source={bellIcon}
            style={styles.bellIcon}
          />
          {notificationCount > 0 && (
            <Text
              style={
                notificationCount > 9
                  ? styles.notificationCountDouble
                  : styles.notificationCountSingle
              }
            >
              {notificationCount}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const ButtonAndroid = () => {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#ddd", true)}
        delayPressIn={0}
      >
        <View>
          <Image
            source={bellIcon}
            style={styles.bellIcon}
          />
          {notificationCount > 0 && (
            <Text
              style={
                notificationCount > 9
                  ? styles.notificationCountDouble
                  : styles.notificationCountSingle
              }
            >
              {notificationCount}
            </Text>
          )}
        </View>
      </TouchableNativeFeedback>
    )
  }

  if (Platform.OS === 'ios'){
    return <ButtonIOS/>
  }else {
    return <ButtonAndroid/>
  }
});

const styles = StyleSheet.create({
  container: {},
  bellIcon: {
    height: 25,
    width: 25
  },
  notificationCountSingle: {
    fontWeight: "700",
    backgroundColor: "#C32026",
    paddingLeft: 7,
    paddingRight: 7,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: "center",
    color: "#fff",
    position: "absolute",
    borderRadius: 50,
    fontSize: 12,
    right: "60%",
    top: "40%"
  },
  notificationCountDouble: {
    fontWeight: "700",
    backgroundColor: "#C32026",
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 3,
    paddingBottom: 3,
    color: "#fff",
    position: "absolute",
    borderRadius: 50,
    fontSize: 12,
    left: "60%",
    top: "40%"
  }
});

export default NotificationButton;
