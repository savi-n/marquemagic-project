import { createContext, useReducer } from "react";

import { localStore, getStore, localStoreUserId } from "../utils/localStore";

const actionTypes = {
  SET_USERID: "SET_USERID",
  SET_USER_BANK_DETAILS: "SET_USER_BANK_DETAILS",
  SET_USER_DETAILS: "SET_USER_DETAILS",
  SET_USER_TOKEN: "SET_USER_TOKEN",
};

const storeData = getStore();

//  Development only
// const INITIAL_STATE = {
//   userId: storeData.userId || null,
//   userDetails: storeData.userDetails || null,
//   userBankDetails: storeData.userBankDetails || null,
//   userToken: storeData.userToken || null,
// };

const INITIAL_STATE = {
  userId: null,
  userDetails: null,
  userBankDetails: null,
  userToken: null,
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

  return {
    setUserId,
    setUserDetails,
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
        userToken: action.data.userToken,
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
