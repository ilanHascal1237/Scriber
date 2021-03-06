import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  FlatList,
  Alert
} from "react-native";
import { SCREENS } from "../constants";

import io from "socket.io-client";

// const BACKEND = 'https://obscure-basin-81956.herokuapp.com';
const BACKEND = "http://192.168.1.88:3000";
const socket = io(BACKEND, { forceNew: true });

socket.on("dupRoom", () => {
  alert("Room already exists");
});
socket.on("noRoom", () => {
  alert("Invalid room code");
});

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.goToHost = () => {
      props.navigation.navigate(SCREENS.HOST, {
        socket,
        code: this.code
      });
    };
    this.goToGuest = () => {
      props.navigation.navigate(SCREENS.USER, {
        socket,
        code: this.code
      });
    };
    this.code = "";
  }

  componentDidMount() {
    socket.on("joinRoomHost", this.goToHost);
    socket.on("joinRoomGuest", this.goToGuest);
  }

  componentWillUnmount() {
    socket.removeListener("joinRoomHost", this.goToHost);
    socket.removeListener("joinRoomGuest", this.goToGuest);
  }

  joinRoom() {
    Alert.prompt("Enter room code", null, code => {
      this.code = code;
      socket.emit("joinRoom", code);
    });
  }

  makeRoom() {
    Alert.prompt("Enter room code", null, code => {
      this.code = code;
      socket.emit("makeRoom", code);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.buttonAlign}>
          <Text style={styles.header}>scriber</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.makeRoom.bind(this)}
          >
            <Text style={styles.buttonLabel}>host</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this.joinRoom.bind(this)}
          >
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
    borderColor: "black",
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
    fontFamily: "System",
    color: "black"
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
    fontFamily: "System",
    fontSize: 55
  },
  headerBorder: {
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    flex: 0
  }
});
