import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, AsyncStorage } from "react-native";
import { SCREENS } from "../constants";

export default class Host extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    code: ""
  };

  render() {
    return (
      <View>
        <View style={styles.headerBorder}>
          <Text style={styles.header}> Host</Text>
        </View>
        <View>
          <Text>Your rooms code is : XXXXXXXX</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TextInput
            style={{
              height: 40,
              textAlign: "center",
              borderWidth: 2,
              borderColor: "black",
              width: 300,
              borderRadius: 50,
              marginTop: 10
            }}
            placeholder="Enter your HOST Code"
            onChangeText={text => this.setState({ code: text })}
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonLabel} onPress={text => this.setState({ code: text })}>
              Submit Code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
/* 
Notes:
-cant let the code box be empty 
- center the text box and submit button
*/

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
    height: 40, //////////////
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
    color: "white",
    fontWeight: "bold"
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
