import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from '../screens/Home';
import Chat from '../screens/Chat';
import Login from '../screens/Login';
import Register from '../screens/Register';
import {useSelector} from 'react-redux';
import { Drawer } from './drawer';
import { Notification } from '../screens/Notification';
import { Setting } from '../screens/Setting';
import { ContactList } from '../screens/ContactList';

const Stack = createStackNavigator();

const index = () => {
  const infoOfUser = useSelector(state => state.userInfo.loginData);

  console.log('infoOfUser', infoOfUser);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {infoOfUser?.uid ? (
          <>
            <Stack.Screen
              name="Home"
              component={Drawer}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Chat"
              component={Chat}
              options={{headerShown: false}}
            />
             <Stack.Screen
              name="Notification"
              component={Notification}
              options={{headerShown: false}}
            />
             <Stack.Screen
              name="Setting"
              component={Setting}
              options={{headerShown: false}}
            />
            <Stack.Screen
            name="ContactList"
            component={ContactList}
            options={{headerShown:false}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default index;
