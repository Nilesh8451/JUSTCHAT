import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import database from '@react-native-firebase/database';
import {Container} from '../../components/container';
import {useDispatch, useSelector} from 'react-redux';
import {storeUserWholeData} from '../../redux/action';
import axios from 'axios';

global.listEventList = '';

export const ContactList = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const infoOfUser = useSelector(state => state.userInfo.loginData);
  const loginUserId = useSelector(state => state.userInfo.loginUserId);
  const userWholeData = useSelector(state => state.userInfo.userWholeData);

  const [filteredList, setFilteredList] = useState([]);
  const dispatch = useDispatch();

  const getUsersList = async () => {
    try {
      global.listEventList = database()
        .ref('/Users')
        .on('value', snapshot => {
          console.log('Snapshot', snapshot);
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
                dispatch(storeUserWholeData(u));
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

  useEffect(() => {
    getUsersList();

    return () => {
      database()?.ref('/Users')?.off?.('value', global.listEventList);
    };
  }, []);

  const handleCancelRequest = item => {
    console.log('calllllllll', item, userWholeData);

    let notifications = [];
    let requestId = [];

    notifications = item.notification?.filter(
      (itm, index) => itm.id != userWholeData.databaseId,
    );

    console.log('Notifications', notifications);

    requestId = userWholeData.requestedIDs?.filter(
      (itm, index) => itm.id != item.databaseId,
    );

    console.log('requestId', requestId);

    database()
      .ref(`/Users/${item.databaseId}`)
      .update({
        notification: [...notifications],
      })
      .then(() => console.log('Data updated.'));

    database()
      .ref(`/Users/${userWholeData.databaseId}`)
      .update({
        requestedIDs: [...requestId],
      })
      .then(() => console.log('Data updated.'));
  };

  const handleAddRequest = item => {
    console.log('calllllllll', item, userWholeData);

    let requestId = [];
    let notifications = [];

    if (userWholeData.requestedIDs?.length > 0) {
      requestId = [...userWholeData.requestedIDs];
    }

    if (item.notification?.length > 0) {
      notifications = [...item.notification];
    }

    console.log('notifications', notifications);

    database()
      .ref(`/Users/${loginUserId}`)
      .update({
        requestedIDs: [
          {
            id: item.databaseId,
            username: item.username,
            type: 'request',
            uid: item.uid,
            name: item.name,
            time: new Date().toUTCString(),
          },
          ...requestId,
        ],
      })
      .then(() => console.log('Data updated.'));

    database()
      .ref(`/Users/${item.databaseId}`)
      .update({
        notification: [
          {
            id: loginUserId,
            username: userWholeData.username,
            type: 'request',
            uid: userWholeData.uid,
            name: userWholeData.name,
            time: new Date().toUTCString(),
          },
          ...notifications,
        ],
      })
      .then(() => console.log('Data updated.'));

    const headers = {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer AAAAdv0qfCE:APA91bF37FoRbQ4DkdL7od35ZCKDqH5eMbDN6JP0PJe946NAEWXcAdnvAcyIIBDCohG3xHTZnlBB2Af9VL-RcnDRSHZPVueOxo-0846ms-lNVwnqB3pW2pght8qdbMyskRBXPY5jupjA',
    };

    axios
      .post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: item.deviceToken,
          data: {},
          notification: {
            body: 'Send you a chat request',
            title: userWholeData.username,
          },
        },
        {
          headers: headers,
        },
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <Container style={{backgroundColor: 'white', flex: 1}} loading={loading}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              style={{width: 30, height: 30, marginRight: 5}}
              source={require('../../assets/images/left-arrow-personal.png')}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontWeight: '700', color: 'black'}}>
            JustChat Users
          </Text>
        </View>
        <Image
          source={require('../../assets/images/Shadow.png')}
          style={{width: '100%', height: 10}}
        />

        <FlatList
          showsVerticalScrollIndicator={false}
          bounces={false}
          data={users}
          keyExtractor={(item, index) => item.uid + item.username}
          renderItem={({item}) => {
            if (item.deactivated == true) {
              return null;
            }

            if (item.uid == infoOfUser?.uid) {
              return null;
            }

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {}}
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

                {userWholeData.requestedIDs?.findIndex(
                  (itm, index) => itm.uid == item.uid,
                ) > -1 ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      handleCancelRequest(item);
                    }}
                    style={styles.requestButton}>
                    <Text
                      style={{
                        color: 'black',
                      }}>
                      Requested
                    </Text>
                  </TouchableOpacity>
                ) : userWholeData.notification?.findIndex(
                    (itm, index) => itm.uid == item.uid,
                  ) > -1 ? (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Notification');
                    }}
                    style={styles.acceptButton}>
                    <Text
                      style={{
                        color: 'black',
                      }}>
                      Accept
                    </Text>
                  </TouchableOpacity>
                ) : userWholeData.friendList?.includes(item.uid) ? null : (
                  <TouchableOpacity
                    onPress={() => {
                      handleAddRequest(item);
                    }}
                    style={styles.addButton}>
                    <Text
                      style={{
                        color: 'black',
                      }}>
                      ADD
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
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
    // backgroundColor: '#A2D2FF',
    // marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: 5,
    // borderRadius: 10,
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
  header: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestButton: {
    position: 'absolute',
    right: 10,
    paddingHorizontal: 5,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    fontFamily: 'ZillaSlab-Medium',
  },
  acceptButton: {
    position: 'absolute',
    right: 10,
    paddingHorizontal: 5,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    fontFamily: 'ZillaSlab-Medium',
  },
  addButton: {
    position: 'absolute',
    right: 10,
    width: 45,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    fontFamily: 'ZillaSlab-Medium',
  },
});
