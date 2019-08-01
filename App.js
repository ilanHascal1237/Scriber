import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { LoginScreen, LoginUserScreen, LoginHostScreen } from "./constants";

// export default function App() {
//   return <View></View>;
// }

const Navigator = createStackNavigator(
  {
    Login: LoginScreen,
    LoginUser: LoginUserScreen,
    LoginHost: LoginHostScreen
  },
  { initialRouteName: SCREENS.LOGIN }
);

export default createAppContainer(Navigator);
