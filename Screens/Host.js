import React, { Component, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage,
  FlatList,
  AlertIOS,
  Image,
  YellowBox
} from "react-native";

import { Audio } from "expo-av";
import FormData from "form-data";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import Icon from "react-native-vector-icons/FontAwesome";

import CameraComponent from "./CameraComponent";

// import Config from "react-native-config";

import { SCREENS } from "../constants";

// const BACKEND = "https://obscure-basin-81956.herokuapp.com";

const BACKEND = "http://192.168.1.88:3000";

console.ignoredYellowBox = ["Remote debugger"];
YellowBox.ignoreWarnings([
  "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);

export default class Host extends Component {
  constructor(props) {
    super(props);

    this.recording = null;
    this.sound = null;

    this.recordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000
      },
      ios: {
        extension: ".wav",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false
      }
    };

    this.state = {
      code: "",
      messages: [],
      haveRecordingPermissions: false,
      isLoading: false,
      isRecording: false,
      isFetching: false,
      isCameraOn: false
    };

    this.socket = null;
    this.addMsg = data => {
      this.setState({
        messages: this.state.messages.concat([data])
      });
    };
    this.editMsg = ({ message, index }) => {
      this.setState({
        messages: Object.assign([], this.state.messages, {
          [index]: message
        })
      });
    };
  }

  componentDidMount() {
    this.socket = this.props.navigation.getParam("socket", null);
    this.setState({ code: this.props.navigation.getParam("code", null) });
    this.socket.on("newMsg", this.addMsg);
    this.socket.on("editMsg", this.editMsg);
  }

  componentWillUnmount() {
    this.socket.emit("removeMyRooms");
    this.socket.removeListener("newMsg", this.addMsg);
    this.socket.removeListener("editMsg", this.editMsg);
  }

  startRecording = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === "granted"
    });
    console.log("starting to record!");
    this.setState({ isLoading: true, isRecording: true });
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });

    const recording = new Audio.Recording();

    try {
      await recording.prepareToRecordAsync(this.recordingOptions);
      await recording.startAsync();
    } catch (error) {
      console.log(error);
    }

    this.recording = recording;

    this.setState({ isLoading: false });
  };

  stopRecording = async () => {
    console.log("stopped recording!");
    this.setState({ isLoading: true, isRecording: false });

    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing - already unloaded
    }

    // const info = await FileSystem.getInfoAsync(this.recording.getURI());
    // console.log(`FILE INFO: ${JSON.stringify(info)}`);

    try {
      const info = await FileSystem.getInfoAsync(this.recording.getURI());
      console.log(`FILE INFO: ${JSON.stringify(info)}`);
      const uri = info.uri;
      console.log("uri:", uri);
      const formData = new FormData();

      formData.append("file", {
        uri,
        type: "audio/x-wav",
        name: "speech2text"
      });

      console.log(formData);

      const response = await fetch(
        "https://us-central1-scriber-1564685823814.cloudfunctions.net/audioToText",
        {
          method: "POST",
          body: formData
        }
      );
      const data = await response.json();
      console.log(data);
      this.socket.emit("newMsg", data.transcript);
    } catch (error) {
      console.log("ERROR:", error);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });

    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: false,
        isMuted: false, // this.state.muted,
        volume: 1.0, // this.state.volume,
        rate: 1.0, // this.state.rate,
        shouldCorrectPitch: true // this.state.shouldCorrectPitch,
      }
      // this._updateScreenForSoundStatus
    );

    this.sound = sound;
    this.setState({ isLoading: false });
  };

  onRecordPressed = () => {
    if (this.state.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  };

  onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.stopAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  editMessage = (item, index) => {
    AlertIOS.prompt(
      "Edit message",
      null,
      message => {
        this.socket.emit("editMsg", {
          message,
          index
        });
      },
      "plain-text",
      this.state.messages[index],
      null
    );
  };

  onPicture = picture => {
    console.log("picture:", picture);
    this.setState({ picture, isCameraOn: false });
    this.uploadImage();
  };

  onCancel() {
    this.setState({ isCameraOn: false });
  }

  async uploadImage() {
    const formData = new FormData();

    formData.append("image", {
      uri: this.state.picture.uri,
      type: "image/jpeg",
      name: "photo.jpg"
    });

    formData.append("id", this.socket.id);

    console.log("formData", formData);

    const response = await fetch(BACKEND + "/image", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });

    console.log("response:", await response.json());
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.isCameraOn ? (
          <CameraComponent
            onPicture={picture => this.onPicture(picture)}
            onCancel={() => this.onCancel()}
          />
        ) : (
          <View style={{ alignItems: "center", padding: 30 }}>
            <View style={{ marginTop: 30 }}>
              <Text style={styles.header}>Room ID: {this.state.code}</Text>
            </View>
            {/* <TextInput
            style={{
              height: 40,
              textAlign: "center",
              borderWidth: 1,
              borderColor: "black",
              width: 250,
              borderRadius: 50,
              marginTop: 10
            }}
            placeholder="Enter your HOST Code"
            onChangeText={text => this.setState({ code: text })}
          />
          <TouchableOpacity style={styles.button}>
            <Text
              style={styles.buttonLabel}
              onPress={text => this.setState({ code: text })}
            >
              submit
            </Text>
          </TouchableOpacity> */}
            <FlatList
              data={this.state.messages}
              style={{ height: 400 }}
              ref="flatList"
              onContentSizeChange={() => this.refs.flatList.scrollToEnd()}
              renderItem={({ item, index }) => {
                if (typeof item === "string") {
                  return (
                    <TouchableOpacity
                      style={styles.textBox}
                      onPress={this.editMessage.bind(this, item, index)}
                      // onLongPress={() => this.setState({ isCameraOn: true })}
                      // delayLongPress={1000}
                    >
                      <Text style={styles.msg}>{item}</Text>
                    </TouchableOpacity>
                  );
                } else {
                  console.log("rendering image", item);
                  return (
                    <View style={[styles.textBox, { overflow: "hidden" }]}>
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: 350, height: 350 }}
                      />
                    </View>
                  );
                }
              }}
            />
            <View
              style={{
                alignItems: "center",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={[styles.recordButton, { marginRight: 30 }]}
                onPress={() => this.setState({ isCameraOn: true })}
              >
                <Icon
                  style={{
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  name="camera"
                  size={40}
                />
              </TouchableOpacity>
              {this.state.isRecording ? (
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    { marginLeft: 30, borderColor: "red" }
                  ]}
                  onPress={this.onRecordPressed}
                >
                  <Icon
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      color: "red"
                    }}
                    name="square"
                    size={40}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.recordButton, { marginLeft: 30 }]}
                  onPress={this.onRecordPressed}
                >
                  <Icon
                    style={{
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    name="microphone"
                    size={40}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* <TouchableOpacity onPress={this.onPlayPausePressed}>
            <Text>Play Button</Text>
          </TouchableOpacity> */}
          </View>
        )}
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
    borderColor: "black",
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
