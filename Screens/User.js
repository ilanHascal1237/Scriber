import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  FlatList
} from "react-native";

export default class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: ['Welcome to Horizons', 'Here is the water coolor', 'Here is the fly infested bathroom'],
      code: 'abc'
    }
    this.socket = null;
  }

  componentDidMount() {
    this.socket = this.props.navigation.getParam('socket', null);
    this.socket.on('newMsg', (data) => {
      this.setState({
        messages: this.state.messages.concat([data])
      })
    })
  }

  render() {
    return (
      <View>
        <View style={{ alignItems: "center", padding: 30 }}>
          <View style={{ marignTop: 30 }}>
            <Text style={styles.header}>room code: {this.state.code}</Text>
          </View>
          <FlatList
            data={this.state.messages}
            style={{ display: 'flex' }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity style={styles.textBox} onPress={this.onRecordPressed}>
                  <Text style={styles.msg}>{item}</Text>
                </TouchableOpacity>
              )
            }}

          />
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
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 45,
    width: 250,
    height: 70,
    backgroundColor: "white",
    borderColor: 'black',
    borderWidth: 1,
    fontWeight: "bold",
    justifyContent: "center"
  },

  textBox: {
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 45,
    backgroundColor: "white",
    borderColor: 'black',
    borderWidth: 1,
    fontWeight: "bold",
    justifyContent: "center",
    width: 310
  },

  msg: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    padding: 10
  },

  recordButton: {
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 45,
    width: 80,
    height: 80,
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
    color: "black"
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
    fontSize: 35
  },
  headerBorder: {
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    flex: 0,
  }
});

