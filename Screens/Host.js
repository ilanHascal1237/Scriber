import React, { Component, useState, useEffect } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	TextInput,
	AsyncStorage,
	FlatList,
	AlertIOS
} from 'react-native';

import { Audio } from 'expo-av';
import FormData from 'form-data';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';

// import Config from "react-native-config";

import { SCREENS } from '../constants';

export default class Host extends Component {
	constructor(props) {
		super(props);

		this.recording = null;
		this.sound = null;

		this.recordingOptions = {
			android: {
				extension: '.m4a',
				outputFormat:
					Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
				audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
				sampleRate: 44100,
				numberOfChannels: 2,
				bitRate: 128000
			},
			ios: {
				extension: '.wav',
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
			code: 'abc',
			messages: [
				'Welcome to Horizons',
				'Here is the water coolor',
				'Here is the fly infested bathroom'
			],
			haveRecordingPermissions: false,
			isLoading: false,
			isRecording: false,
			isFetching: false
		};

		this.socket = null;
		this.addMsg = data => {
			this.setState({
				messages: this.state.messages.concat([data])
			});
		};
	}

	componentDidMount() {
		this.socket = this.props.navigation.getParam('socket', null);
		this.socket.on('newMsg', this.addMsg);
	}

	componentWillUnmount() {
		this.socket.emit('removeMyRooms');
		this.socket.removeListener('newMsg', this.addMsg);
	}

	startRecording = async () => {
		const response = await Permissions.askAsync(
			Permissions.AUDIO_RECORDING
		);
		this.setState({
			haveRecordingPermissions: response.status === 'granted'
		});
		console.log('starting to record!');
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
		console.log('stopped recording!');
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
			console.log('uri:', uri);
			const formData = new FormData();

			formData.append('file', {
				uri,
				type: 'audio/x-wav',
				name: 'speech2text'
			});

			console.log(formData);

			const response = await fetch(
				'https://us-central1-scriber-1564685823814.cloudfunctions.net/audioToText',
				{
					method: 'POST',
					body: formData
				}
			);
			const data = await response.json();
			console.log(data);
			this.socket.emit('newMsg', data.transcript);
		} catch (error) {
			console.log('ERROR:', error);
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

		const {
			sound,
			status
		} = await this.recording.createNewLoadedSoundAsync(
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
			'Edit message',
			null,
			message => {
				this.setState({
					messages: Object.assign([], this.state.messages, {
						[index]: message
					})
				});
			},
			'plain-text',
			this.state.messages[index],
			null
		);
	};

	render() {
		return (
			<View>
				<View style={{ alignItems: 'center', padding: 30 }}>
					<View style={{ marignTop: 30 }}>
						<Text style={styles.header}>
							room code: {this.state.code}
						</Text>
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
						style={{ display: 'flex' }}
						renderItem={({ item, index }) => {
							return (
								<TouchableOpacity
									style={styles.textBox}
									onPress={this.editMessage.bind(
										this,
										item,
										index
									)}
								>
									<Text style={styles.msg}>{item}</Text>
								</TouchableOpacity>
							);
						}}
					/>

					<TouchableOpacity
						style={styles.recordButton}
						onPress={this.onRecordPressed}
					>
						<Icon
							style={{
								alignItems: 'center',
								justifyContent: 'center'
							}}
							name="microphone"
							size={40}
						/>
					</TouchableOpacity>
					{/* <TouchableOpacity onPress={this.onPlayPausePressed}>
            <Text>Play Button</Text>
          </TouchableOpacity> */}
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
		display: 'flex',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
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
		backgroundColor: 'white',
		borderColor: 'black',
		borderWidth: 1,
		fontWeight: 'bold',
		justifyContent: 'center'
	},

	textBox: {
		paddingTop: 5,
		paddingBottom: 5,
		marginTop: 10,
		marginLeft: 5,
		marginRight: 5,
		borderRadius: 45,
		backgroundColor: 'white',
		borderColor: 'black',
		borderWidth: 1,
		fontWeight: 'bold',
		justifyContent: 'center',
		width: 310
	},

	msg: {
		borderBottomColor: 'black',
		borderBottomWidth: 1,
		padding: 10
	},

	recordButton: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 10,
		marginTop: 10,
		marginLeft: 5,
		marginRight: 5,
		borderRadius: 45,
		width: 80,
		height: 80,
		backgroundColor: 'white',
		borderColor: 'black',
		borderWidth: 1,
		fontWeight: 'bold',
		justifyContent: 'center'
	},

	buttonAlign: {
		justifyContent: 'center',
		flex: 1,
		width: 250
	},

	buttonLabel: {
		textAlign: 'center',
		fontSize: 30,
		fontFamily: 'System',
		color: 'black'
	},
	header: {
		marginTop: 10,
		marginBottom: 20,
		textAlign: 'center',
		color: 'black',
		fontWeight: 'bold',
		fontSize: 35
	},
	headerBorder: {
		height: 50,
		justifyContent: 'center',
		borderRadius: 10,
		flex: 0
	}
});
