import React, { Component, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  AsyncStorage
} from "react-native";
import { SCREENS } from "../constants";

export default class Host extends Component {
  constructor(props) {
    super(props);

    this.recording = null;
    this.sound = null;

    this.recordingOptions = {
      // android not currently in use, but parameters are required
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
      haveRecordingPermissions: false,
      isLoading: false,
      isRecording: false,
      isFetching: false
    };
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
            <Text
              style={styles.buttonLabel}
              onPress={text => this.setState({ code: text })}
            >
              Submit Code
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <TouchableOpacity onPress={this.onRecordPressed}>
            <Text>Record Button</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onPlayPausePressed}>
            <Text>Play Button</Text>
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
