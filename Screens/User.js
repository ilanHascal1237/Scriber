import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  FlatList,
  Picker,
  Button,
  Share,
  Image,
  YellowBox
} from "react-native";

import { Linking } from "react-native";

console.ignoredYellowBox = ["Remote debugger"];
YellowBox.ignoreWarnings([
  "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);

export default class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      code: "",
      language: "en"
    };
    this.socket = null;
    this.addMsg = data => {
      this.setState({
        messages: [...this.state.messages, data],
        selectingLanguage: false
      });
    };
    this.updateMsg = messages => {
      console.log(messages);
      this.setState({ messages });
    };
    this.editMsg = ({ message, index }) => {
      this.setState({
        messages: Object.assign([], this.state.messages, {
          [index]: message
        })
      });
    };
  }

  formatMessages() {
    return this.state.messages.join("\n");
  }

  componentDidMount() {
    this.socket = this.props.navigation.getParam("socket", null);
    this.setState({ code: this.props.navigation.getParam("code", null) });
    this.socket.on("newMsg", this.addMsg);
    this.socket.on("translate", this.updateMsg);
    this.socket.on("editMsg", this.editMsg);
  }

  componentWillUnmount() {
    this.socket.emit("removeMyRooms");
    this.socket.removeListener("newMsg", this.addMsg);
    this.socket.removeListener("translate", this.updateMsg);
    this.socket.removeListener("editMsg", this.editMsg);
  }

  translatePressed() {
    if (this.state.selectingLanguage) {
      this.socket.emit("translate", {
        messages: this.state.messages,
        language: this.state.language
      });
      this.setState({ selectingLanguage: false });
    } else {
      this.setState({ selectingLanguage: true });
    }
  }

  render() {
    return (
      <View>
        <View
          style={{
            alignItems: "center",
            paddingTop: 30
          }}
        >
          <View style={{ marignTop: 30 }}>
            <Text style={styles.header}>Room ID: {this.state.code}</Text>
          </View>
          <FlatList
            data={this.state.messages}
            style={{
              height: 400
            }}
            ref="flatList"
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() => this.refs.flatList.scrollToEnd()}
            renderItem={({ item }) => {
              if (typeof item === "string") {
                return (
                  <TouchableOpacity
                    style={styles.textBox}
                    onPress={this.onRecordPressed}
                  >
                    <Text style={styles.msg}>{item}</Text>
                  </TouchableOpacity>
                );
              } else {
                console.log("rendering image", item);
                return (
                  <View
                    style={[
                      styles.textBox,
                      {
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center"
                      }
                    ]}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: 350, height: 350 }}
                    />
                  </View>
                );
              }
            }}
          />
          <Button
            onPress={this.translatePressed.bind(this)}
            title={this.state.selectingLanguage ? "Confirm" : "Translate"}
          />
          <Button
            onPress={() => {
              Share.share(
                { message: this.formatMessages() },
                { subject: "scriber transcript" }
              );
            }}
            title="Share transcript"
          />
          {this.state.selectingLanguage && (
            <Picker
              selectedValue={this.state.language}
              style={{ alignSelf: "stretch" }}
              onValueChange={(itemValue, itemIndex) => {
                console.log(itemValue);
                this.setState({ language: itemValue });
              }}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Spanish" value="es" />
              <Picker.Item label="French" value="fr" />
              <Picker.Item label="Chinese" value="zh" />
              <Picker.Item label="Russian" value="ru" />
            </Picker>
          )}
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

  picker: {},

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
    borderColor: "black",
    borderWidth: 1,
    fontWeight: "bold",
    justifyContent: "center"
  },

  textBox: {
    padding: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 45,
    backgroundColor: "white",
    borderColor: "black",
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
    display: "flex",
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
    fontSize: 35
  },
  headerBorder: {
    height: 50,
    justifyContent: "center",
    borderRadius: 10,
    flex: 0
  }
});
