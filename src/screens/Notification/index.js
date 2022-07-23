import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React from 'react';
import {Container} from '../../components/container';
import {useState} from 'react';
import {useSelector} from 'react-redux';
import moment from 'moment';
import database from '@react-native-firebase/database';
import axios from 'axios';

export const Notification = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [notification, setNotification] = useState(false);
  const [lastSeen, setLastSeen] = useState(false);

  const infoOfUser = useSelector(state => state.userInfo.loginData);
  const loginUserId = useSelector(state => state.userInfo.loginUserId);
  const userWholeData = useSelector(state => state.userInfo.userWholeData);

  const handleConfirm = item => {
    // console.log('>>>>>', item, userWholeData, loginUserId);

    database()
      .ref(`/Users/${item.id}`)
      .once('value')
      .then(snapshot => {
        console.log('User data: ', snapshot.val());
        const data = snapshot.val();
        let friendList1 = [];
        let friendList2 = [];

        let requestId = [];
        let notifications = [];

        if (userWholeData.friendList?.length > 0) {
          friendList1 = [...userWholeData?.friendList];
        }

        if (data.friendList?.length > 0) {
          friendList2 = [...data?.friendList];
        }

        // console.log('friendList1', friendList1, 'friendList2', friendList2);

        if (userWholeData.notification?.length > 0) {
          notifications = userWholeData.notification.filter(itm => {
            return item.id != itm.id;
          });
        }

        if (data.requestedIDs?.length > 0) {
          requestId = snapshot.val().requestedIDs.filter(itm => {
            return itm.id != loginUserId;
          });
        }

        // console.log('notifications', notifications, requestId);

        database()
          .ref(`/Users/${loginUserId}`)
          .update({
            notification: [...notifications],
            friendList: [...friendList1, item.uid],
          })
          .then(() => console.log('Data updated.'));

        database()
          .ref(`/Users/${item.id}`)
          .update({
            requestedIDs: [...requestId],
            friendList: [...friendList2, userWholeData.uid],
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
              to: data.deviceToken,
              data: {},
              notification: {
                body: 'Accepted you chat request',
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
      });
  };

  const handleDelete = item => {
    console.log('>>>>>', item, userWholeData, loginUserId);

    database()
      .ref(`/Users/${item.id}`)
      .once('value')
      .then(snapshot => {
        // console.log('User data: ', snapshot.val());
        const data = snapshot.val();
        let friendList1 = [];
        let friendList2 = [];

        let requestId = [];
        let notifications = [];

        if (userWholeData.notification?.length > 0) {
          notifications = userWholeData.notification.filter(itm => {
            return item.id != itm.id;
          });
        }

        if (data.requestedIDs?.length > 0) {
          requestId = snapshot.val().requestedIDs.filter(itm => {
            return itm.id != loginUserId;
          });
        }

        // console.log('notifications', notifications, requestId);

        database()
          .ref(`/Users/${loginUserId}`)
          .update({
            notification: [...notifications],
          })
          .then(() => console.log('Data updated.'));

        database()
          .ref(`/Users/${item.id}`)
          .update({
            requestedIDs: [...requestId],
          })
          .then(() => console.log('Data updated.'));
      });
  };

  return (
    <Container style={styles.container} loading={loading}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              style={{width: 30, height: 30, marginRight: 5}}
              source={require('../../assets/images/left-arrow-personal.png')}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontWeight: '700', color: 'black'}}>
            Notifications
          </Text>
        </View>
        <Image
          source={require('../../assets/images/Shadow.png')}
          style={{width: '100%', height: 10}}
        />

        <FlatList
          data={userWholeData.notification}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity style={styles.cardContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    flexWrap: 'wrap',
                  }}>
                  <View style={styles.userIcon}>
                    <Text style={styles.userIconText}>
                      {item?.username?.slice(0, 1)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      paddingHorizontal: 15,
                    }}>
                    <Text style={styles.notiText}>
                      <Text style={styles.notiUsername}>{item.username}</Text>{' '}
                      requested to chat with you{' - '}
                      <Text style={{color: 'black', fontSize: 12}}>
                        {moment(new Date(item.time)).calendar()}
                      </Text>
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: '100%',
                    flexDirection: 'row',
                    marginTop: 5,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      handleConfirm(item);
                    }}
                    style={styles.confirmButt}>
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleDelete(item);
                    }}
                    style={{
                      marginLeft: 5,
                      ...styles.confirmButt,
                    }}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.noNotiText}>No Pending Notifications</Text>
          }
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
  header: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 15,
    paddingLeft: 10,
    borderBottomColor: '#D8DEE9',
    borderBottomWidth: 2,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E3C9',
    marginVertical: 5,
  },
  userIconText: {
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    color: 'black',
    fontFamily: 'ZillaSlab-Medium',
  },
  notiText: {
    fontSize: 16,
    fontFamily: 'ZillaSlab-Medium',
    color: 'black',
  },
  notiUsername: {
    fontSize: 16,
    fontFamily: 'ZillaSlab-Bold',
    color: 'black',
  },
  confirmButt: {
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: 'black',
    fontFamily: 'ZillaSlab-Medium',
  },
  noNotiText: {
    fontSize: 18,
    fontFamily: 'ZillaSlab-Medium',
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
    color: 'black',
  },
});
