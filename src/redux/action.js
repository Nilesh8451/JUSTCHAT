import {
  STORELOGINDATA,
  REMOVEUSERDATA,
  REMOVELOGOUTUSERID,
  STORELOGINID,
  STOREUSERNAME,
  STOREUSERWHOLEDATA,
} from './type';

export const loginDataFun = data => {
  return {
    type: STORELOGINDATA,
    payload: data,
  };
};
export const removeUserFun = id => {
  return {
    type: REMOVEUSERDATA,
    payload: id,
  };
};

export const removeLogoutUserId = () => {
  return {
    type: REMOVELOGOUTUSERID,
  };
};

export const storeUserId = id => {
  return {
    type: STORELOGINID,
    payload: id,
  };
};

export const storeUserName = name => {
  return {
    type: STOREUSERNAME,
    payload: name,
  };
};

export const storeUserWholeData = data => {
  return {
    type: STOREUSERWHOLEDATA,
    payload: data,
  };
};
