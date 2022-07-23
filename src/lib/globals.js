import { Dimensions } from 'react-native';

export const WINDOW = Dimensions.get('window');

const { width: screenWidth, height: screenHeight } = WINDOW;
const realWidth = screenHeight > screenWidth ? screenWidth : screenHeight;

export const deviceWidth = screenWidth;
export const deviceHeight = screenHeight;

const compareScreenWidth = 375;
const compareScreenHeight = 667;

export const normalize = (size) => {
	return Math.round((size * realWidth) / compareScreenWidth);
};