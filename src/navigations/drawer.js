import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Home from '../screens/Home';
import {useEffect} from 'react';
import {LogBox} from 'react-native';
import { Notification } from '../screens/Notification';
import { Setting } from '../screens/Setting';
import { CustomDrawer } from './customDrawer';

export const Drawer = () => {
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator initialRouteName="Home"  drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      {/* <Drawer.Screen
        name="Notifications"
        component={Notification}
        options={{headerShown: false}}
      /> */}
      {/* <Drawer.Screen
        name="Setting"
        component={Setting}
        options={{headerShown: false}}
      /> */}

      {/* <Drawer.Screen name="Notifications" component={NotificationsScreen} /> */}
    </Drawer.Navigator>
  );
};
