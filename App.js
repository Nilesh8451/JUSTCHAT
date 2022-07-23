import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import Home from './src/screens/Home';
import SplashScreen from 'react-native-splash-screen';
import MainScreen from './src/navigations/index';
import {Provider} from 'react-redux';
import messaging from '@react-native-firebase/messaging';

const App = () => {

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission()
    SplashScreen.hide();
  }, []);
  return <MainScreen />;
};

export default App;
