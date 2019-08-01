import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { LoginScreen, UserScreen, HostScreen } from "./Screens";
import { SCREENS } from "./constants";

// export default function App() {
//   return <View></View>;
// }

const Navigator = createStackNavigator(
  {
    Login: LoginScreen,
    User: UserScreen,
    Host: HostScreen
  },
  { initialRouteName: SCREENS.LOGIN }
);

export default createAppContainer(Navigator);
