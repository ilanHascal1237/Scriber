import React, { Component } from "react";
import { Text, View, TouchableOpacity, Dimensions } from "react-native";
import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";

import Icon from "react-native-vector-icons/FontAwesome";

export default class CameraComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasCameraPermission: null,
      type: Camera.Constants.Type.back
    };
  }

  componentDidMount = async () => {
    console.log("componentDidMount cameraComponent");
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  };

  snapPicture = async () => {
    let photo = await this.camera.takePictureAsync();
    // console.log("photo:", photo);
    this.props.onPicture(photo);
  };

  renderTopBar = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start"
      }}
    >
      <View
        style={{
          height: 100,
          backgroundColor: "transparent",
          justifyContent: "flex-start",
          marginLeft: 30,
          marginTop: 30,
          alignItems: "center",
          flexDirection: "row"
        }}
      >
        <TouchableOpacity onPress={() => this.props.onCancel()}>
          <Icon
            style={{
              alignItems: "center",
              justifyContent: "center"
            }}
            name="times"
            size={50}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  renderBottomBar = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end"
      }}
    >
      <View
        style={{
          height: 100,
          backgroundColor: "transparent",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row"
        }}
      >
        <TouchableOpacity onPress={this.snapPicture}>
          <Icon
            style={{
              alignItems: "center",
              justifyContent: "center"
            }}
            name="circle"
            size={50}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    return (
      <View style={{ alignItems: "stretch", flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={{ flex: 1, width: Dimensions.get("window").width }}
          type={this.state.type}
        >
          {this.renderTopBar()}
          {this.renderBottomBar()}
        </Camera>
      </View>
    );
  }
}
