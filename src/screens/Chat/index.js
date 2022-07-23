import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  LogBox,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Container} from '../../components/container';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {normalize} from '../../lib/globals';
import {KeyboardAwareView} from 'react-native-keyboard-aware-view';
import ENIcon from 'react-native-vector-icons/Entypo';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {ImageComponent} from '../../components/Image';
import {AutoScrollFlatList} from 'react-native-autoscroll-flatlist';
import SimpleToast from 'react-native-simple-toast';
import axios from 'axios';
import {storeUserWholeData} from '../../redux/action';
import {useDispatch, useSelector} from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';

let listner1 = '';

let listner2 = '';

global.messagesList = '';

const ChatScreen = ({route, navigation}) => {
  console.log('r........', route);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [blockList, setBlockList] = useState([]);
  const [youBlocked, setYouBlocked] = useState(false);
  const [meBlocked, setMeBlocked] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState('');
  const inputRef = useRef();
  const [transferred, setTransferred] = useState(0);
  const [deviceToken, setDeviceToken] = useState('');
  const [images, setImage] = useState([
    {
      url: '',
    },
  ]);
  const [visible, setVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentLoginUser] = useState('');
  const [showLastSeen, setShowLastSeen] = useState(true);
  const userWholeData = useSelector(state => state.userInfo.userWholeData);

  const dispatch = useDispatch();
  useEffect(() => {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
  }, []);

  useEffect(() => {
    try {
      global.messagesList = database()
        .ref('/Messages')
        .on('value', snapshot => {
          console.log('Snapshot', snapshot);
          let res = snapshot?.val?.();
          console.log('res', res);

          if (res !== null) {
            console.log(res);
            console.log(Object.values(res));

            let data = Object.values(res);

            data = data.sort(function (a, b) {
              return new Date(b.time) - new Date(a.time);
            });

            if (messageList.length != data.length) {
              setMessageList(Object.values(data));
            }

            setLoading(false);
          }

          setLoading(false);
        });
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }, []);

  const sendMessage = () => {
    if (message) {
      const newReference = database().ref('/Messages').push();

      newReference
        .set({
          fromUid: route.params?.loginUserInfo?.uid,
          toUid: route.params?.data?.uid,
          message: message,
          time: new Date().toUTCString(),
        })
        .then(() => {
          setMessage('');
          inputRef.current.focus();
        });

      if (!(userWholeData.showNotification == false)) {
        const headers = {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer AAAAdv0qfCE:APA91bF37FoRbQ4DkdL7od35ZCKDqH5eMbDN6JP0PJe946NAEWXcAdnvAcyIIBDCohG3xHTZnlBB2Af9VL-RcnDRSHZPVueOxo-0846ms-lNVwnqB3pW2pght8qdbMyskRBXPY5jupjA',
        };

        axios
          .post(
            'https://fcm.googleapis.com/fcm/send',
            {
              to: deviceToken,
              data: {},
              notification: {
                body: message,
                title: currentUser,
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
      }
    }
  };

  const getBlockList = () => {
    listner1 = database()
      .ref(`/Users/${route.params.userDatabaseId}`)
      .on('value', snapshot => {
        console.log('User data 1: ', snapshot.val());
        let data = snapshot.val();
        let list = data?.blockList ? data.blockList : [];
        setBlockList(list);
        if (data.showLastSeen == false) {
          setShowLastSeen(data.showLastSeen);
        }

        setCurrentLoginUser(data?.name);
        dispatch(storeUserWholeData(data));
        let idx = list.findIndex(val => val == route.params.data.uid);

        if (idx != -1) {
          setYouBlocked(true);
        } else {
          setYouBlocked(false);
        }
      });

    listner2 = database()
      .ref(`/Users/${route.params.data.databaseId}`)
      .on('value', snapshot => {
        console.log('User data 2: ', snapshot.val());
        let data = snapshot.val();
        let list = data?.blockList ? data.blockList : [];
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
        if (data.showLastSeen == false) {
          setShowLastSeen(data.showLastSeen);
        }

        setDeviceToken(data?.deviceToken);
        let idx = list.findIndex(val => val == route.params.loginUserInfo?.uid);

        if (idx != -1) {
          setMeBlocked(true);
        } else {
          setMeBlocked(false);
        }
      });
  };

  useEffect(() => {
    getBlockList();

    return () => {
      database()
        .ref(`/Users/${route.params.data.databaseId}`)
        ?.off?.('value', listner2);

      database()
        .ref(`/Users/${route.params.userDatabaseId}`)
        ?.off?.('value', listner1);

      database().ref(`/Messages`)?.off?.('value', global.messagesList);
    };
  }, []);

  const blockUnblockContact = () => {
    let list = [...blockList];

    let idx = list.findIndex(val => val == route.params.data.uid);

    if (idx == -1) {
      list.push(route.params.data.uid);
    } else {
      list.splice(idx, 1);
    }

    setTimeout(() => {
      database()
        .ref(`/Users/${route.params.userDatabaseId}`)
        .update({
          blockList: list,
        })
        .then(() => {
          getBlockList();
        });
    }, 0);
  };

  const handleImagePickPress = () => {
    launchImageLibrary({quality: 0.4}, async res => {
      console.log('Res of Image', res);

      let imgResult = res?.assets[0];

      var imageSize = imgResult.fileSize / (1024 * 1024);
      console.log('IMAGE SIZE DIRECTION', imageSize);
      if (imageSize <= 1) {
        let uri = decodeURI(imgResult?.uri);

        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri =
          Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        setTransferred(0);

        const task = storage().ref(filename).putFile(uploadUri);
        // set progress state
        task.on('state_changed', snapshot => {
          setTransferred(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
        });
        try {
          await task;

          const url = await storage().ref(filename).getDownloadURL();

          const newReference = database().ref('/Messages').push();

          newReference
            .set({
              fromUid: route.params?.loginUserInfo?.uid,
              toUid: route.params?.data?.uid,
              message: url,
              type: 'asset',
              time: new Date().toUTCString(),
            })
            .then(() => {
              setTransferred(0);
              const headers = {
                'Content-Type': 'application/json',
                Authorization:
                  'Bearer AAAAdv0qfCE:APA91bF37FoRbQ4DkdL7od35ZCKDqH5eMbDN6JP0PJe946NAEWXcAdnvAcyIIBDCohG3xHTZnlBB2Af9VL-RcnDRSHZPVueOxo-0846ms-lNVwnqB3pW2pght8qdbMyskRBXPY5jupjA',
              };

              axios
                .post(
                  'https://fcm.googleapis.com/fcm/send',
                  {
                    to: deviceToken,
                    data: {},
                    notification: {
                      body: 'Send you an image',
                      title: currentUser,
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
            })
            .catch(e => {
              console.log('Error', e);
            });
        } catch (e) {
          console.log(e);
          setTransferred(0);
          SimpleToast.show(
            'Something went wrong, Please try again later!',
            SimpleToast.SHORT,
            ['RCTModalHostViewController'],
          );
        }
      } else {
        Alert.alert('Warning', 'File size is more than 1 MB');
      }
    });
  };

  useEffect(() => {
    if (messageList.length > 0) {
      let messages = [];
      messageList.map((item, index) => {
        if (
          route.params?.loginUserInfo?.uid == item.fromUid &&
          item.toUid == route.params?.data?.uid
        ) {
          if (isEmpty == true) {
            setIsEmpty(false);
          }

          messages.push({...item, from: 'self'});
        } else if (
          route.params?.loginUserInfo?.uid == item.toUid &&
          item.fromUid == route.params?.data?.uid
        ) {
          if (isEmpty == true) {
            setIsEmpty(false);
          }

          messages.push({...item, from: 'to'});
        } else {
        }
      });

      setChatMessages(messages);
    }
  }, [messageList]);

  return (
    <Container style={{flex: 1}} loading={loading}>
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            overflow: 'hidden',
            paddingBottom: 5,
          }}>
          <View style={styles.header}>
            {/* {console.log('userWholeData', userWholeData)} */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  style={{width: 30, height: 30, marginRight: 5}}
                  source={require('../../assets/images/left-arrow-personal.png')}
                />
              </TouchableOpacity>
              <View>
                <Text
                  style={styles.username}>
                  {route.params.name}
                </Text>

                {isOnline || (lastSeen && showLastSeen) ? (
                  <Text
                    style={{
                      color: isOnline ? 'green' : 'red',
                      opacity: isOnline ? 1 : 0.6,
                      fontWeight: 'bold',
                      fontSize: normalize(12),
                      fontFamily: 'ZillaSlab-Bold',
                    }}>
                    {isOnline
                      ? 'Active Now'
                      : lastSeen && showLastSeen
                      ? 'Last seen ' + moment(new Date(lastSeen)).calendar()
                      : ''}
                  </Text>
                ) : null}
              </View>
            </View>
            {route.params.self || youBlocked || meBlocked ? null : (
              <TouchableOpacity
                onPress={() => {
                  blockUnblockContact();
                }}
                style={{
                  borderWidth: 1,
                  padding: 4,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  borderColor: 'red',
                }}>
                <Text
                  style={{
                    color: 'red',
                    fontSize: 18,
                    fontFamily: 'ZillaSlab-Medium',
                  }}>
                  Block
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {isEmpty == true && loading == false ? (
          <View style={{flex: 1}}>
            {meBlocked || youBlocked ? null : (
              <Text
                style={styles.noHistory}>
                No conversion history available, please start sending
                messages...
              </Text>
            )}
          </View>
        ) : null}
        <KeyboardAwareView style={{flex: 1}}>
          <FlatList
            inverted
            style={{marginBottom: 70}}
            data={chatMessages}
            keyExtractor={(item, index) =>
              item?.time?.toString() + item.message
            }
            renderItem={({item, index}) => {
              if (item.from == 'self') {
                return (
                  <>
                    <TouchableOpacity activeOpacity={0.9} style={{}}>
                      <View style={{paddingHorizontal: 10, marginVertical: 10}}>
                        <Text
                          style={{
                            alignSelf: 'flex-end',
                            fontSize: 10,
                            marginBottom: 5,
                            color: 'black',
                            fontFamily: 'ZillaSlab-Medium',
                          }}>
                          {moment(new Date(item.time)).format('h:mm a')}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          }}>
                          <ImageComponent
                            style={{width: 30, height: 30, borderRadius: 50}}
                            source={{
                              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBeJIaj90AxSdQ4kugN7RK9TPBhiMcFKiiuXZ6FNw4Sj5mZ8xvPfARHTlsOyerqs8tLS4&usqp=CAU',
                            }}
                          />
                          {item.type != 'asset' ? (
                            <TouchableOpacity
                              activeOpacity={1}
                              onLongPress={() => {
                                Clipboard.setString(item.message);
                                Toast.show(
                                  'Message coppied to clipboard',
                                  Toast.SHORT,
                                  ['RCTModalHostViewController'],
                                );
                              }}
                              style={{
                                backgroundColor: '#FFA6D5',
                                width: 200,
                                borderRadius: 5,
                                justifyContent: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  paddingHorizontal: 8,
                                  paddingVertical: 5,
                                  fontFamily: 'ZillaSlab-Medium',
                                  fontSize: 15,
                                }}>
                                {item.message}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={{
                                width: normalize(130),
                                height: normalize(130),
                              }}
                              onPress={() => {
                                setImage([{url: item.message}]);
                                setVisible(true);
                              }}>
                              <ImageComponent
                                resizeMode="stretch"
                                source={{uri: item.message}}
                                style={{
                                  width: normalize(130),
                                  height: normalize(130),
                                  borderRadius: 5,
                                }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                    {moment(new Date(item.time)).format('MMMM Do YYYY') !=
                    moment(new Date(chatMessages[index + 1]?.time)).format(
                      'MMMM Do YYYY',
                    ) ? (
                      <>
                        <View
                          style={{
                            width: '100%',
                            paddingVertical: 5,
                            backgroundColor: '#F3EFEA',
                            marginVertical: 5,
                          }}>
                          <Text
                            style={{
                              alignSelf: 'center',
                              fontSize: 10,
                              color: 'black',
                              fontFamily: 'ZillaSlab-Medium',
                            }}>
                            {moment(new Date(item.time)).format('MMMM Do YYYY')}
                          </Text>
                        </View>
                      </>
                    ) : null}
                  </>
                );
              } else if (item.from == 'to') {
                if (isEmpty == true) {
                  setIsEmpty(false);
                }

                return (
                  <>
                    <TouchableOpacity activeOpacity={0.9} style={{}}>
                      <View style={{paddingHorizontal: 10, marginVertical: 10}}>
                        <Text
                          style={{
                            alignSelf: 'flex-start',
                            fontSize: 10,
                            marginBottom: 5,
                            marginLeft: 35,
                            color: 'black',
                            fontFamily: 'ZillaSlab-Medium',
                          }}>
                          {moment(new Date(item.time)).format('h:mm a')}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <ImageComponent
                            style={{width: 30, height: 30, borderRadius: 50}}
                            source={{
                              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2-lk-RYREmhV89n8yLwXTuOW2wkBMi_RLTg&usqp=CAU',
                            }}
                          />
                          {item.type != 'asset' ? (
                            <TouchableOpacity
                              activeOpacity={1}
                              onLongPress={() => {
                                Clipboard.setString(item.message);
                                Toast.show(
                                  'Message coppied to clipboard',
                                  Toast.SHORT,
                                  ['RCTModalHostViewController'],
                                );
                              }}
                              style={{
                                backgroundColor: '#88E0EF',
                                width: 200,
                                borderRadius: 5,
                              }}>
                              <Text style={styles.messageText}>
                                {item.message}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={{
                                width: normalize(130),
                                height: normalize(130),
                              }}
                              onPress={() => {
                                setImage([{url: item.message}]);
                                setVisible(true);
                              }}>
                              <ImageComponent
                                resizeMode="stretch"
                                source={{uri: item.message}}
                                style={{
                                  width: normalize(130),
                                  height: normalize(130),
                                  borderRadius: 5,
                                }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {moment(new Date(item.time)).format('MMMM Do YYYY') !=
                    moment(new Date(chatMessages[index + 1]?.time)).format(
                      'MMMM Do YYYY',
                    ) ? (
                      <>
                        <View style={styles.dateTextContainer}>
                          <Text style={styles.dateText}>
                            {moment(new Date(item.time)).format('MMMM Do YYYY')}
                          </Text>
                        </View>
                      </>
                    ) : null}
                  </>
                );
              } else {
                return <></>;
              }
            }}
          />

          <View style={{position: 'absolute', bottom: 10, width: '100%'}}>
            <View
              style={{
                marginHorizontal: 10,
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  onSubmitEditing={() => sendMessage()}
                  style={styles.sendInput}
                  value={message}
                  onChangeText={val => setMessage(val)}
                  placeholder="Enter Your Message..."
                  placeholderTextColor={'black'}
                />
                <TouchableOpacity
                  onPress={() => {
                    handleImagePickPress();
                  }}
                  style={{position: 'absolute', right: 12}}>
                  <ENIcon name="image" color={'black'} size={normalize(20)} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  sendMessage();
                }}
                style={styles.sendButtonContainer}>
                <Text style={styles.sendButton}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareView>
      </SafeAreaView>
      {meBlocked || youBlocked ? (
        <View style={styles.blockUnblockContainer}>
          {meBlocked ? (
            <>
              <Text style={styles.blockMessage}>
                You can't send the message because you are blocked !
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.goBackContainer}>
                <Text style={styles.goBackText}>GO BACK</Text>
              </TouchableOpacity>
            </>
          ) : youBlocked ? (
            <>
              <Text style={styles.blockMessage}>
                You can't send the message because you blocked this contact !
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => {
                    blockUnblockContact();
                  }}
                  style={{...styles.goBackContainer, marginLeft: 0}}>
                  <Text style={styles.goBackText}>UNBLOCK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.goBackContainer}>
                  <Text style={styles.goBackText}>GO BACK</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      <Modal visible={visible} transparent={true}>
        <ImageViewer
          renderHeader={() => (
            <TouchableOpacity
              style={styles.modalCross}
              onPress={() => {
                setVisible(false);
                setImage([{url: ''}]);
              }}>
              <AntIcon name="close" color={'white'} size={normalize(30)} />
            </TouchableOpacity>
          )}
          onCancel={() => {
            setVisible(false);
            setImage([{url: ''}]);
          }}
          renderIndicator={() => {
            return <></>;
          }}
          imageUrls={images}
        />
      </Modal>

      {transferred != 0 ? (
        <View
          style={{
            ...styles.imgTransferMain,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
          }}>
          <View style={styles.imgTransferContainer}>
            <Text style={styles.imgTransferedText}>
              {parseInt(transferred)} %
            </Text>
          </View>
        </View>
      ) : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    paddingVertical: 10,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    justifyContent: 'space-between',
  },
  imgTransferMain: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgTransferContainer: {
    width: 150,
    height: 150,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgTransferedText: {
    fontSize: 25,
    fontWeight: '500',
    fontFamily: 'ZillaSlab-Bold',
    color: 'black',
  },
  modalCross: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    zIndex: 100,
    elevation: 10,
    zIndex: 100,
    elevation: 10,
  },
  blockUnblockContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  blockMessage: {
    color: 'white',
    fontSize: normalize(26),
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Medium',
    textAlign: 'center',
  },
  goBackContainer: {
    borderWidth: 1,
    borderColor: 'white',
    marginTop: 20,
    marginLeft: 30,
    width: 140,
    height: 40,
    justifyContent: 'center',
  },
  goBackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Medium',
    textAlign: 'center',
  },
  sendButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1597E5',
    width: '28%',
    marginLeft: 5,
    borderRadius: 20,
    height: 40,
  },
  sendButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ZillaSlab-Medium',
  },
  sendInput: {
    borderWidth: 1,
    borderRadius: 30,
    width: '100%',
    height: '100%',
    color: 'black',
    paddingHorizontal: 10,
    fontFamily: 'ZillaSlab-Medium',
    paddingRight: 40,
  },
  inputContainer: {
    width: '70%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 10,
    color: 'black',
    fontFamily: 'ZillaSlab-Medium',
  },
  dateTextContainer: {
    width: '100%',
    paddingVertical: 5,
    backgroundColor: '#F3EFEA',
    marginVertical: 5,
  },
  messageText: {
    color: 'black',
    paddingHorizontal: 5,
    paddingVertical: 5,
    fontFamily: 'ZillaSlab-Medium',
    color: 'black',
    fontSize: 15,
  },
  username:{
     color: 'black',
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'ZillaSlab-Bold',
  },
  noHistory:{
    fontSize: 18,
                  fontFamily: 'ZillaSlab-Medium',
                  textAlign: 'center',
                  marginTop: 50,
                  paddingHorizontal: 20,
                  color: 'black',
  }
});

export default ChatScreen;
