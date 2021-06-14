import { createContext, useReducer } from "react";

import { localStore, getStore, localStoreUserId } from "../utils/localStore";

const actionTypes = {
  SET_USERID: "SET_USERID",
  SET_USER_BANK_DETAILS: "SET_USER_BANK_DETAILS",
  SET_USER_DETAILS: "SET_USER_DETAILS",
  SET_USER_TOKEN: "SET_USER_TOKEN",
  SET_OTHER_USER_TOKEN: "SET_OTHER_USER_TOKEN",
};

const storeData = getStore();

// //  Development only
// const INITIAL_STATE = {
//   userId: storeData.userId || null,
//   userDetails: storeData.userDetails || null,
//   userBankDetails: storeData.userBankDetails || null,
//   userAccountToken: storeData.userAccountToken || null,
//   userToken: storeData.userToken || null, // ACCOUNT TOKEN
//   coapplicant: null,
//   gurantor: null,
// };
// //End Developement

const INITIAL_STATE = {
  userId: null,
  userDetails: null,
  userBankDetails: null,
  userAccountToken: null,
  userToken: null,
  coapplicant: null,
  gurantor: null,
};

const useActions = (dispatch) => {
  const setUserId = (userId) => {
    localStoreUserId(userId);
    dispatch({ type: actionTypes.SET_USERID, userId });
  };

  const setUserDetails = (userDetails) => {
    localStore(userDetails);
    dispatch({ type: actionTypes.SET_USER_DETAILS, data: userDetails });
  };

  const setOtherUserDetails = (userDetails, userType) => {
    dispatch({
      type: actionTypes.SET_OTHER_USER_TOKEN,
      data: userDetails,
      userType,
    });
  };

  return {
    setUserId,
    setUserDetails,
    setOtherUserDetails,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USERID: {
      return {
        ...state,
        userId: action.userId,
      };
    }

    case actionTypes.SET_USER_DETAILS: {
      return {
        ...state,
        userDetails: action.data.userDetails,
        userBankDetails: action.data.userBankDetails,
        userAccountToken: action.data.userAccountToken,
        userToken: action.data.userToken,
      };
    }

    case actionTypes.SET_OTHER_USER_TOKEN: {
      return {
        ...state,
        [action.userType]: action.data,
      };
    }

    default: {
      return { ...state };
    }
  }
}

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <UserContext.Provider value={{ state, actions }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
