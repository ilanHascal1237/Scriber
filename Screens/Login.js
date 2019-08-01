import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, AsyncStorage } from "react-native";
import { SCREENS } from "../constants";

class Login extends React.Component {
  constructor(props) {
    super(props);
  }
  // state = {

  // }

  render() {
    return (
      <View>
        <View>
          <Text>Welcome to Scriber!</Text>
        </View>
        <View>
          <TextInput placeholder="Enter your password"> </TextInput>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
