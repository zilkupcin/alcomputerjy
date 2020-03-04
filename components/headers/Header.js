import React from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform
} from "react-native";
import NotificationButton from "../buttons/NotificationButton";

const backIcon = require("../../assets/back.png");
const logo = require("../../assets/logo.png");

const Header = React.memo(
  ({
    hasParent,
    onBackPress,
    onNotificationsPress,
    notificationCount
  }) => {
    const BlankComponent = () => {
      return <View style={styles.blankComponent} />;
    };

    const BackIconAndroid = () => {
      return (
        <TouchableNativeFeedback
          onPress={onBackPress}
          background={TouchableNativeFeedback.Ripple("#ddd", true)}
          delayPressIn={0}
        >
          <View>
            <Image
              source={backIcon}
              style={styles.backIcon}
            />
          </View>
        </TouchableNativeFeedback>
      );
    };

    const BackIconIos = () => {
      return (
        <TouchableOpacity
          onPress={onBackPress}
          background={TouchableNativeFeedback.Ripple("#ddd", true)}
          delayPressIn={0}
        >
          <View>
            <Image
              source={require("../../assets/back.png")}
              style={styles.backIcon}
            />
          </View>
        </TouchableOpacity>
      );
    }

    const DrawerIcon = () => {
      return (
        <TouchableOpacity>
          <Image
            source={require("../../assets/menu.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.headerContainer}>
        {hasParent ? (
          Platform.OS === 'ios' ? <BackIconIos /> :<BackIconAndroid/>
        ) : (
          <NotificationButton
            onPress={onNotificationsPress}
            notificationCount={notificationCount}
          />
        )}
        <Image
          source={logo}
          style={styles.headerImage}
        />
        <BlankComponent />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#DFDFDF",
    borderBottomWidth: 1
  },
  headerImage: {
    height: 30,
    width: 120
  },
  bellIcon: {
    height: 25,
    width: 25
  },
  menuIcon: {
    height: 25,
    width: 25
  },
  blankComponent: {
    height: 25,
    width: 25
  },
  backIcon: {
    height: 25,
    width: 25
  }
});

export default Header;
