import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, AsyncStorage, FlatList } from "react-native";
import { SCREENS } from "../constants";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.buttonAlign}>
          <Text style={styles.header}>scriber</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(SCREENS.HOST)}>
            <Text style={styles.buttonLabel}>host</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonLabel}>join</Text>
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
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 45,
    height: 70,
    backgroundColor: "white",
    borderColor: 'black',
    borderWidth: 1,
    fontWeight: "bold",
    justifyContent: "center"
  },

  buttonAlign: {
    justifyContent: "center",
    flex: 1,
    width: 250
  },

  buttonLabel: {
    textAlign: "center",
    fontSize: 30,
    fontFamily: 'System',
    //fontWeight: 'bold',
    color: "black"
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
    fontSize: 45
  },
  headerBorder: {
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    flex: 0,
  }
});
