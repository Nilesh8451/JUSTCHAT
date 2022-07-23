import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import {Container} from '../../components/container';
import {useState} from 'react';
import ToggleSwitch from 'toggle-switch-react-native';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';

export const Setting = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [notification, setNotification] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const loginUserId = useSelector(state => state.userInfo.loginUserId);

  const userWholeData = useSelector(state => state.userInfo.userWholeData);

  console.log(userWholeData, 'userWholeData');

  useEffect(() => {
    if (userWholeData) {
      if (
        userWholeData.showLastSeen == false ||
        userWholeData.showLastSeen == true
      ) {
        setLastSeen(userWholeData.showLastSeen);
      }

      if (
        userWholeData.showNotification == false ||
        userWholeData.showNotification == true
      ) {
        setNotification(userWholeData.showNotification);
      }
    }
  }, [userWholeData]);

  const UpdateLastSeen = status => {
    if (loginUserId) {
      setTimeout(() => {
        database()
          .ref(`/Users/${loginUserId}`)
          .update({
            showLastSeen: status,
          })
          .then(() => {});
      }, 0);
    }
  };

  const UpdateNoti = status => {
    if (loginUserId) {
      setTimeout(() => {
        database()
          .ref(`/Users/${loginUserId}`)
          .update({
            showNotification: status,
          })
          .then(() => {});
      }, 0);
    }
  };

  return (
    <Container style={styles.container} loading={loading}>
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            width: '100%',
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              style={{width: 30, height: 30, marginRight: 5}}
              source={require('../../assets/images/left-arrow-personal.png')}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontWeight: '700', color: 'black'}}>
            Settings
          </Text>
        </View>
        <Image
          source={require('../../assets/images/Shadow.png')}
          style={{width: '100%', height: 10}}
        />

        <View style={{flex: 1, paddingHorizontal: 20, marginTop: 20}}>
          <View style={{...styles.itemContainer,opacity:0.3}}>
            <Text style={{fontSize: 20, fontWeight: '600', color: 'black'}}>
              Private Account
            </Text>
            <ToggleSwitch
              isOn={privateAccount}
              onColor="#12D5F2"
              offColor="gray"
              labelStyle={{color: 'black', fontWeight: '900'}}
              size="medium"
              disabled
              onToggle={isOn => setPrivateAccount(isOn)}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={{fontSize: 20, fontWeight: '600', color: 'black'}}>
              Allow Notifications
            </Text>
            <ToggleSwitch
              isOn={notification}
              onColor="#12D5F2"
              offColor="gray"
              labelStyle={{color: 'black', fontWeight: '900'}}
              size="medium"
              onToggle={isOn => {
                setNotification(isOn);
                UpdateNoti(isOn);
              }}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={{fontSize: 20, fontWeight: '600', color: 'black'}}>
              Last Seen
            </Text>
            <ToggleSwitch
              isOn={lastSeen}
              onColor="#12D5F2"
              offColor="gray"
              labelStyle={{color: 'black', fontWeight: '900'}}
              size="medium"
              onToggle={isOn => {
                setLastSeen(isOn);
                UpdateLastSeen(isOn);
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
});
