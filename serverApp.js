import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import io from 'socket.io-client';

const BACKEND = 'http://localhost:3000';
const socket = io(BACKEND, { forceNew: true });

socket.on('hi', data => {
	console.log(data);
});

export default function App() {
	return (
		<View style={styles.container}>
			<Text>Open up App.js to start working on your app!</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	}
});
