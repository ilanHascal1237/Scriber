import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, AsyncStorage } from "react-native";
import { SCREENS } from "../constants";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  // state = {

  // }

  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.headerBorder}>
          <Text style={styles.header}>Welcome to Scriber!</Text>
        </View>
        <View style={styles.buttonAlign}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(SCREENS.HOST)}>
            <Text style={styles.buttonLabel}>Press for Host</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonLabel}>Press for User</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  button: {
    alignSelf: "stretch",
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5, ////////////////
    height: 70, //////////////
    backgroundColor: "red",
    fontWeight: "bold",
    justifyContent: "center"
  },

  buttonAlign: {
    justifyContent: "space-evenly", /////////
    flex: 1,
    backgroundColor: "#F5FCFF",
    alignSelf: "stretch"
  },

  buttonLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "white"
  },
  header: {
    marginTop: 10,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 25
  },
  headerBorder: {
    backgroundColor: "red",
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    flex: 0,
    alignSelf: "stretch"
  }
});
