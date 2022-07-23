import React from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';

export const Container = ({
  children,
  style,
  loading = false,
  withKeyboard = true,
}) => {
  const renderContainer = React.useCallback(
    () => (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          ...style,
        }}>
        <Modal animationType={'fade'} transparent={true} visible={loading}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#000000aa',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LottieView
              source={require('../../assets/images/json/loading.json')}
              style={{width: 190, height: 190}}
              autoPlay
              loop
            />
          </View>
        </Modal>
        {children}
      </View>
    ),
    [children,loading],
  );

  return withKeyboard ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {renderContainer()}
    </TouchableWithoutFeedback>
  ) : (
    renderContainer()
  );
};
