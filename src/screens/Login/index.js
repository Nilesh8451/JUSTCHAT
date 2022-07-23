import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';

import {Container} from '../../components/container';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import {loginDataFun} from '../../redux/action';
import {useDispatch, useSelector} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ENIcon from 'react-native-vector-icons/Entypo';

const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const logoutUserId = useSelector(state => state.userInfo.logoutUserId);
  const [showeye, setShoweye] = useState(false);
  console.log('logoutUserId', logoutUserId);

  const dispatch = useDispatch();

  const loginUser = () => {
    try {
      setLoading(true);
      auth()
        .signInWithEmailAndPassword(username, password)
        .then(user => {
          console.log('User signed in!', user);
          Toast.show('Successfully Signed In', Toast.SHORT, [
            'RCTModalHostViewController',
          ]);
          setUsername('');
          setPassword('');
          setUserInfo(user.user._user);
          dispatch(loginDataFun(user.user._user));
          setLoading(false);
        })
        .catch(error => {
          console.log(error, error.code);
          setLoading(false);

          if (error.code === 'auth/user-not-found') {
            Toast.show('Wrong username or password', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          } else if (error.code === 'auth/invalid-email') {
            Toast.show('Please enter valid email address', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          } else if (error.code == 'auth/wrong-password') {
            Toast.show('Wrong username or password', Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          } else {
            Toast.show(error.toString(), Toast.SHORT, [
              'RCTModalHostViewController',
            ]);
          }
        });
    } catch (e) {
      console.log(e);
      Toast.show(e.toString(), Toast.SHORT, ['RCTModalHostViewController']);
      setLoading(false);
    }
  };

  return (
    <Container
      loading={loading}
      style={{
        flex: 1,
      }}
      withKeyboard={true}>
      <View style={styles.backImgContainer}>
        <Image
          style={{width: '100%', height: '100%'}}
          source={require('../../assets/images/pexels-cottonbro-7120126.jpg')}
        />
        <View style={styles.overlay}></View>
      </View>
      <KeyboardAwareScrollView>
        <SafeAreaView>
          <Text style={styles.pageName}>Login</Text>
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Enter Email</Text>

            <View style={styles.inputContainer}>
              <TextInput
                value={username}
                onChangeText={val => setUsername(val)}
                style={styles.inputTextStyle}
                placeholder="Email"
                placeholderTextColor={'rgba(255,255,255,0.6)'}
              />
            </View>
            <Text
              style={{
                marginTop: 20,
                ...styles.inputLabel,
              }}>
              Enter Password
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={password}
                onChangeText={val => setPassword(val)}
                style={styles.inputTextStyle}
                secureTextEntry={!showeye}
                placeholder="Password"
                placeholderTextColor={'rgba(255,255,255,0.6)'}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 5,
                  bottom: 0,
                  height: '100%',
                  padding: 5,
                }}
                onPress={() => {
                  setShoweye(prevState => !prevState);
                }}>
                {showeye ? (
                  <ENIcon name="eye" size={20} color="white" />
                ) : (
                  <ENIcon name="eye-with-line" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                loginUser();
              }}
              style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Register');
              }}
              style={{
                marginVertical: 10,
              }}>
              <Text style={styles.registerText}>
                Not a member register here
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  backImgContainer: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pageName: {
    fontSize: 40,
    color: 'white',
    marginTop: 20,
    marginLeft: 20,
    fontFamily: 'Lobster-Regular',
  },
  formContainer: {
    marginVertical: 10,
    marginTop: 150,
    marginHorizontal: 20,
  },
  inputLabel: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'ZillaSlab-Medium',
  },
  inputContainer: {
    borderBottomWidth: 2,
    marginVertical: 10,
    borderBottomColor: '#E7E0C9',
    paddingBottom: 5,
    marginTop: 10,
  },
  inputTextStyle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'ZillaSlab-Medium',
    height: 30,
    padding:0
  },
  buttonContainer: {
    backgroundColor: '#FDEFEF',
    alignItems: 'center',
    borderRadius: 50,
    marginVertical: 30,
    paddingVertical: 10,
    width: '50%',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Bold',
  },
  registerText: {
    color: '#F4DFD0',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Medium',
  },
});

export default Login;
