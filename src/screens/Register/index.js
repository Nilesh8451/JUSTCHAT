import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Container} from '../../components/container';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from '@react-native-firebase/database';
import RBSheet from 'react-native-raw-bottom-sheet';
import {normalize} from '../../lib/globals';

const Register = ({navigation}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const rbRef = useRef(null);
  const [userGeneratedName, setUserGeneratedName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isErrpr, setIsError] = useState(false);
  const [databaseUsernames, setDatabaseUsernames] = useState([]);

  const [registeredUserInfo, setRegisteredInfo] = useState({});

  global.usernameListenar = '';

  const getUserNamesFromDatabase = async () => {
    try {
      global.usernameListenar = database()
        .ref('/Usernames')
        .on('value', snapshot => {
          console.log('Snapshot', snapshot);
          let res = snapshot?.val?.();

          console.log('USERNAMES', res);

          if (res !== null) {
            let arr = [];

            for (let i in res) {
              console.log(i);
              arr.push(res[i].name);
            }

            setDatabaseUsernames(arr);
          }
        });
    } catch (e) {}
  };

  const registerUser = () => {
    try {
      setLoading(true);

      auth()
        .createUserWithEmailAndPassword(username, password)
        .then(user => {
          console.log('User account created & signed in!', user);
          setRegisteredInfo(user);
          setLoading(false);
          setTimeout(() => {
            rbRef.current.open();
          }, 500);
          // const userDocument = firestore().collection('Users').add({
          //   email: user.user._user.email,
          //   uid: user.user._user.uid,
          //   name: name,
          // });

          // console.log('userDocument', userDocument);
        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');

            Toast.show('That email address is already in use!', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          } else if (error.code === 'auth/invalid-email') {
            console.log('Please enter valid email address');

            Toast.show('Please enter valid email address', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          } else {
            Toast.show('Please provide valid information', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          }

          console.log(error);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserNamesFromDatabase();

    return () => {
      database()?.ref('/Usernames')?.off?.('value', global.usernameListenar);
    };
  }, []);

  const onUsernameChange = val => {
    setUserGeneratedName(val);

    if (val.length <= 3) {
      setErrorText('At least 4 char long');
      setIsError(true);
    } else {
      if (val.length > 25) {
        setErrorText('At most 25 char long');
        setIsError(true);
        return;
      }

      if (!databaseUsernames.includes(val)) {
        setErrorText('Username is available');
        setIsError(false);
      } else {
        setErrorText('Username is unavailable');
        setIsError(true);
      }
    }
  };

  const storeUserInfo = async () => {
    Toast.show('User is Created Successfully', Toast.SHORT, [
      'RCTModalHostViewController',
    ]);

    const newReference2 = database().ref('/Usernames').push();

    newReference2
      .set({
        name: userGeneratedName,
      })
      .then(() => {
        console.log('Stored.....');
      })
      .catch(e => {
        console.log('Error', e);
      });

    const newReference = database().ref('/Users').push();

    newReference
      .set({
        email: registeredUserInfo.user._user.email,
        uid: registeredUserInfo.user._user.uid,
        name: name,
        isOnline: false,
        blockList: [],
        username: userGeneratedName,
        requestedIDs: [],
        notification: [],
        friendList: [],
        blockedList: [],
      })
      .then(() => {
        setLoading(false);
        navigation.navigate('Login');
      })
      .catch(e => {
        setLoading(false);
      });
  };

  return (
    <Container
      loading={loading}
      style={{
        flex: 1,
      }}>
      <View
        style={styles.screenBack}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={require('../../assets/images/pexels-cottonbro-7120126.jpg')}
        />
        <View
          style={styles.screenOverlay}></View>
      </View>
      <KeyboardAwareScrollView>
        <SafeAreaView>
          <Text
            style={styles.screenName}>
            Register
          </Text>

          <View
            style={{
              marginVertical: 10,
              marginTop: 130,
              marginHorizontal: 20,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: 'white',
                fontFamily: 'ZillaSlab-Medium',
              }}>
              Enter Name
            </Text>

            <View
              style={{
                borderBottomWidth: 2,
                borderBottomColor: '#E7E0C9',
                marginVertical: 10,
                marginTop: 10,
                paddingBottom: 5,
              }}>
              <TextInput
                value={name}
                onChangeText={val => setName(val)}
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'ZillaSlab-Medium',
                  height: 30,
                  padding: 0,
                }}
                placeholder="Your Name"
                placeholderTextColor={'rgba(255,255,255,0.6)'}
              />
            </View>

            <Text
              style={{
                fontSize: 18,
                color: 'white',
                marginTop: 20,
                fontFamily: 'ZillaSlab-Medium',
              }}>
              Enter Email
            </Text>

            <View
              style={{
                borderBottomWidth: 2,
                borderBottomColor: '#E7E0C9',
                marginVertical: 10,
                marginTop: 10,
                paddingBottom: 5,
              }}>
              <TextInput
                value={username}
                onChangeText={val => setUsername(val)}
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'ZillaSlab-Medium',
                  height: 30,
                  padding: 0,
                }}
                placeholder="Email"
                placeholderTextColor={'rgba(255,255,255,0.6)'}
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                color: 'white',
                fontFamily: 'ZillaSlab-Medium',
                marginTop: 20,
              }}>
              Enter Password
            </Text>
            <View
              style={{
                borderBottomWidth: 2,
                marginVertical: 10,
                borderBottomColor: '#E7E0C9',
                paddingBottom: 5,
                marginTop: 10,
              }}>
              <TextInput
                value={password}
                onChangeText={val => setPassword(val)}
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'ZillaSlab-Medium',
                  height: 30,
                  padding: 0,
                }}
                placeholder="Password"
                placeholderTextColor={'rgba(255,255,255,0.6)'}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                // navigation.navigate('Login');
                registerUser();
              }}
              style={{
                backgroundColor: '#FDEFEF',
                alignItems: 'center',
                borderRadius: 50,
                marginVertical: 30,
                paddingVertical: 10,
                width: '50%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'ZillaSlab-Bold',
                }}>
                Register
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={{
                marginVertical: 10,
              }}>
              <Text
                style={{
                  color: '#F4DFD0',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'ZillaSlab-Medium',
                }}>
                Already have an account, login
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
      <RBSheet
        ref={rbRef}
        // closeOnDragDown={true}
        closeOnPressMask={false}
        openDuration={250}
        animationType={'slide'}
        customStyles={customStyles}>
        <KeyboardAwareScrollView>
          {/* <AddComment /> */}
          <View
            style={styles.modalHeader}>
            <Text
              style={styles.headerText}>
              Welcome to JUSTCHAT Community
            </Text>
          </View>

          <View style={{padding: 20}}>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontFamily: 'ZillaSlab-Medium',
                textAlign: 'center',
              }}>
              {` You can add your friends here, chat with them, can use several features provided by us.\n To get started, please enter your desired username for JUSTCHAT community`}
            </Text>
          </View>

          <Image
            source={{
              uri: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-MrETuFTfU9JZlbM05nv53tbz8N-psmNhyg&usqp=CAU`,
            }}
            style={styles.img}
          />

          <Text
            style={styles.usernameText}>
            Please enter your user name
          </Text>
          <View style={{width: '85%', alignSelf: 'center'}}>
            <TextInput
              style={styles.usernameInput}
              placeholder="Username"
              placeholderTextColor={'rgba(0,0,0,0.3)'}
              value={userGeneratedName}
              onChangeText={val => onUsernameChange(val)}
            />
            <Text
              style={{
                color: isErrpr ? 'red' : 'green',
                fontSize: 16,
                fontFamily: 'ZillaSlab-Bold',
              }}>
              {errorText}
            </Text>
          </View>
          <TouchableOpacity
            disabled={!(isErrpr == false && userGeneratedName.length >= 4)}
            onPress={() => {
              // navigation.navigate('Login');
              // registerUser();
              storeUserInfo();
            }}
            style={{
              backgroundColor:
                isErrpr == false && userGeneratedName.length >= 4
                  ? '#A2D2FF'
                  : 'gray',
              alignItems: 'center',
              borderRadius: 50,
              marginVertical: 30,
              paddingVertical: 10,
              width: 170,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'ZillaSlab-Bold',
              }}>
              Continue
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </RBSheet>
    </Container>
  );
};

const styles = StyleSheet.create({
  usernameInput:{
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
    height: 40,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 8,
    color: 'black',
  },
  usernameText:{
    color: 'black',
    fontSize: 18,
    fontFamily: 'ZillaSlab-Medium',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  img:{
    width: 90,
    height: 90,
    borderRadius: 100,
    alignSelf: 'center',
  },
  modalHeader:{
    width: '100%',
    height: 60,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText:{
    color: 'black',
                fontSize: 19,
                fontWeight: 'bold',
                fontFamily: 'ZillaSlab-Medium',
  },
  screenBack:{
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screenOverlay:{
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  screenName:{
    fontSize: 40,
    color: 'white',
    marginTop: 20,
    marginLeft: 20,
    fontFamily: 'Lobster-Regular',
  }
})

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
    height: '75%',
    width: '100%',
  },
});

export default Register;
