import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  AppState,
  TextInput,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Container} from '../../components/container';
import {useDispatch, useSelector} from 'react-redux';
import {
  storeUserId,
  storeUserName,
  storeUserWholeData,
} from '../../redux/action';
import database from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FIcon from 'react-native-vector-icons/Feather';

import {normalize} from '../../lib/globals';
import messaging from '@react-native-firebase/messaging';

global.eventListner = '';

const Home = ({navigation, route}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const infoOfUser = useSelector(state => state.userInfo.loginData);
  const [userDatabaseId, setDatabaseId] = useState('');
  const [appStates, setAppStates] = useState(AppState.currentState);
  const dispatch = useDispatch();
  const rbRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const userWholeData = useSelector(state => state.userInfo.userWholeData);
  const [noFriends, setNoFriends] = useState(false);

  const getUsersList = async () => {
    try {
      setLoading(true);
      global.eventListner = database()
        .ref('/Users')
        .on('value', snapshot => {
          // console.log('Snapshot', snapshot);
          let res = snapshot?.val?.();

          if (res !== null) {
            let arr = [];

            for (let i in res) {
              arr.push({
                ...res[i],
                databaseId: i,
              });
            }

            arr = arr.sort((a, b) => a?.username?.localeCompare(b.username));

            setUsers(arr);
            setFilteredList(arr);

            arr.map(async u => {
              if (infoOfUser.uid == u.uid) {
                // console.log('Called again __________', u.uid, u);
                const token = await messaging().getToken();

                // console.log('DEVICE TOKEN', token);
                dispatch(storeUserWholeData(u));
                setDatabaseId(u.databaseId);
                dispatch(storeUserId(u.databaseId));
                database()
                  .ref(`/Users/${u.databaseId}`)
                  .update({
                    isOnline: true,
                    deviceToken: token,
                  })
                  .then(() => console.log('Data updated.'));
              }
            });

            setLoading(false);
          }

          setLoading(false);
        });
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const offline = id => {
    database().ref('/Users').off('value', global.eventListner);
    if (id) {
      setTimeout(() => {
        database()
          .ref(`/Users/${id}`)
          .update({
            isOnline: false,
            lastSeen: new Date().toUTCString(),
          })
          .then(() => {});
      }, 0);
    }
  };

  useEffect(() => {
    getUsersList();

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      database()?.ref('/Users')?.off?.('value', global.eventListner);
    };
  }, [infoOfUser]);

  const handleAppStateChange = nextAppState => {
    console.log('APP STATE', appStates, nextAppState);

    if (nextAppState == 'inactive' || nextAppState == 'background') {
      offline(userDatabaseId);
    } else {
      database().ref('/Users').on('value', global.eventListner);
    }

    setAppStates(nextAppState);
  };

  useEffect(() => {
    if (userDatabaseId) {
      AppState.addEventListener('change', handleAppStateChange);
    }
  }, [userDatabaseId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userDatabaseId) {
        database()
          .ref(`/Users/${userDatabaseId}`)
          .once('value')
          .then(snapshot => {
            console.log('User data 1: ', snapshot.val());
            let data = snapshot.val();

            dispatch(storeUserWholeData(data));
          });
      }
    }, [userDatabaseId]),
  );

  useEffect(() => {
    if (users.length > 0 && userWholeData.uid) {
      let ourUsers = [...users];

      ourUsers = ourUsers.filter((item, index) => {
        return (
          item.deactivated != true &&
          userWholeData.friendList?.includes(item.uid)
        );
      });

      if (userWholeData.friendList?.length > 0) {
        if (ourUsers.length > 0) {
          setNoFriends(false);
        } else {
          setNoFriends(true);
        }
      } else {
        setNoFriends(true);
      }
    }
  }, [users, userWholeData]);

  return (
    <Container style={styles.container} loading={loading}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{height: 30, justifyContent: 'space-evenly'}}>
            <View style={styles.menuBigLine}></View>
            <View style={styles.menuSmallLine}></View>
            <View style={styles.menuBigLine}></View>
          </TouchableOpacity>
          <Text style={styles.headerText}>Messages</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              navigation.navigate('Notification');
            }}>
            <Icon name="notifications" size={30} color="black" />
            {userWholeData.notification?.length > 0 ? (
              <View style={styles.notiCount}>
                <Text style={{color: 'white', fontSize: 12}}>
                  {userWholeData.notification?.length}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
        <View style={styles.titleView}></View>
        <View style={{flex: 1}}>
          {noFriends == true && loading == false ? (
            <Text style={styles.noFriendText}>
              No Friend's Added, Please Request Users For Chat
            </Text>
          ) : null}
          <FlatList
            showsVerticalScrollIndicator={false}
            bounces={false}
            data={users}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              if (item.deactivated == true) {
                return null;
              }

              if (item.uid == infoOfUser?.uid) {
                setUserName(item.name);
                dispatch(storeUserName(item.name));
              }

              if (!userWholeData.friendList?.includes(item.uid)) {
                return null;
              }

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      name: item.name,
                      data: item,
                      loginUserInfo: infoOfUser,
                      userDatabaseId: userDatabaseId,
                      self: item.uid == infoOfUser?.uid,
                    })
                  }
                  style={styles.contactView}>
                  <View style={styles.leftView}>
                    <Text
                      style={{
                        ...styles.leftText,
                        textTransform: 'uppercase',
                        color: 'black',
                        fontFamily: 'ZillaSlab-Medium',
                      }}>
                      {item?.username?.slice(0, 1)}
                    </Text>
                    {item.isOnline ? (
                      <View style={styles.onlinePt}></View>
                    ) : null}
                  </View>
                  <View>
                    <Text
                      style={{
                        ...styles.nameText,
                        textTransform: 'capitalize',
                        color: 'black',
                        fontFamily: 'ZillaSlab-Medium',
                      }}>
                      {item.username}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              !loading ? (
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'ZillaSlab-Medium',
                    textAlign: 'center',
                    marginTop: 50,
                    paddingHorizontal: 20,
                    color: 'black',
                  }}>
                  You Don't Have Any Friends Added
                </Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
      <TouchableOpacity
        onPress={() => navigation.navigate('ContactList')}
        style={styles.plusContainer}>
        <FIcon name="plus" size={35} color="rgba(0,0,0,0.5)" />
      </TouchableOpacity>
    </Container>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  titleView: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleColor: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  contactView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 15,
    paddingLeft: 10,
    borderBottomColor: '#D8DEE9',
    borderBottomWidth: 2,
  },
  leftView: {
    width: 40,
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E3C9',
    marginVertical: 5,
    marginRight: 10,
  },
  leftText: {
    fontWeight: '900',
    fontSize: 16,
  },
  nameText: {
    fontSize: 16,
    color: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#D8DEE9',
    borderBottomWidth: 2,
  },
  menuBigLine: {
    width: 30,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  menuSmallLine: {
    width: 20,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  headerText: {
    fontSize: 22,
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Medium',
  },
  notiCount: {
    position: 'absolute',
    top: -5,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 20,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendText: {
    alignSelf: 'center',
    textAlign: 'center',
    color: 'black',
    fontFamily: 'ZillaSlab-Medium',
    fontSize: normalize(18),
    marginTop: 50,
  },
  onlinePt: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 7,
    height: 7,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  plusContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: '#E5E3C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const customStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rbga(0,0,0,0.4)',
  },
  draggableIcon: {
    backgroundColor: 'black',
  },
  container: {
    borderTopRightRadius: normalize(20),
    borderTopLeftRadius: normalize(20),
    borderColor: '#d6d6d6',
    borderWidth: 1,
    height: '95%',
    width: '100%',
  },
});

export default Home;
