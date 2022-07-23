import React, {useRef} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useDispatch, useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import {removeUserFun} from '../redux/action';
import auth from '@react-native-firebase/auth';

export const CustomDrawer = ({...props}) => {
  const loginUserId = useSelector(state => state.userInfo.loginUserId);
  const dispatch = useDispatch();
  const loginUserName = useSelector(state => state.userInfo.loginUserName);
  const userWholeData = useSelector(state => state.userInfo.userWholeData);

  const offline = () => {
    database().ref('/Users').off('value', global.eventListner);
    console.log('called again id', loginUserId);
    if (loginUserId) {
      setTimeout(() => {
        database()
          .ref(`/Users/${loginUserId}`)
          .update({
            isOnline: false,
            lastSeen: new Date().toUTCString(),
          })
          .then(() => {});
      }, 0);
    }
  };

  const logoutUser = () => {
    auth()
      .signOut()
      .then(() => {
        offline(loginUserId);
        dispatch(removeUserFun(loginUserId));
        Toast.show('Successfully logged out!', Toast.SHORT, [
          'RCTModalHostViewController',
        ]);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const routes = [
    {
      title: 'Home',
      route: 'Home',
    },
    // {
    //   title: 'Notifications',
    //   route: 'Notifications',
    // },
    {
      title: 'Settings',
      route: 'Setting',
    },
  ];

  let alertRef = useRef();

  const _DisplayRoutes = (item, index) => {
    return (
      <View
        key={index}
        style={{
          width: '100%',
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 5,
        }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            props.navigation.navigate(item.route);
            props.navigation.closeDrawer();
          }}
          style={{flex: 1}}>
          <View style={{marginLeft: 20}}>
            <Text style={{color: 'black', fontSize: 20, fontWeight: '700'}}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{flex: 1}} {...props}>
      <DrawerContentScrollView contentContainerStyle={{flex: 1}}>
        <View
          style={{
            width: '100%',
            height: 180,
            paddingTop: 30,
            paddingLeft: 20,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.6)',
          }}>
          <Image
            source={{
              uri: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-MrETuFTfU9JZlbM05nv53tbz8N-psmNhyg&usqp=CAU`,
            }}
            style={{width: 90, height: 90, borderRadius: 100}}
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              marginTop: 10,
              color: 'black',
            }}>
            {userWholeData.name}
          </Text>
        </View>
        <View style={{marginTop: 20}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {routes.map((item, index) => {
              return _DisplayRoutes(item, index);
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => {
            console.log('loginUserId', loginUserId, global.eventListner);
            logoutUser();
          }}
          style={{
            position: 'absolute',
            bottom: 30,
            width: '100%',
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              fontWeight: '700',
              paddingLeft: 20,
            }}>
            Logout
          </Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    </View>
  );
};
