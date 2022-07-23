import {
  STORELOGINDATA,
  REMOVEUSERDATA,
  REMOVELOGOUTUSERID,
  STORELOGINID,
  STOREUSERNAME,
  STOREUSERWHOLEDATA,
} from './type';

const initialState = {
  loginData: {},
  logoutUserId: '',
  loginUserId: '',
  loginUserName: '',
  userWholeData: {},
};

export const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case STORELOGINDATA:
      return {
        ...state,
        loginData: action.payload,
      };
    case REMOVEUSERDATA:
      return {
        ...state,
        loginData: {},
        logoutUserId: action.payload,
        userWholeData: {},
      };
    case REMOVELOGOUTUSERID:
      return {
        ...state,
        logoutUserId: '',
        userWholeData: {},
      };

    case STORELOGINID:
      return {
        ...state,
        loginUserId: action.payload,
      };
    case STOREUSERNAME: {
      return {
        ...state,
        loginUserName: action.payload,
      };
    }
    case STOREUSERWHOLEDATA: {
      return {
        ...state,
        userWholeData: action.payload,
      };
    }
    default:
      return {
        ...state,
      };
  }
};
