import { createContext, useReducer } from "react";

import { setStore, getStore } from "../utils/localStore";

const APP_REDUCER = "appReducer";

const storeData = getStore()[APP_REDUCER] || {};

const actionTypes = {
  SET_WHITELABEL_ID: "SET_WHITELABEL_ID",
  SET_CLIENT_TOKEN: "SET_CLIENT_TOKEN", //ClientVerify api
  SET_BANK_TOKEN: "SET_BANK_TOKEN", // customer token from generatelink api
  SET_REQUEST_ID: "SET_REQUEST_ID", // customer token generatelink api
  SET_LOGO: "SET_LOGO",
};

const INITIAL_STATE = {
  whiteLabelId: null,
  clientToken: null, // CLIENT TOKEN
  bankToken: null, // CUSTOMER TOKEN
  bankRequestId: null, // REQUEST ID
  logo: null,
};

const useActions = (dispatch) => {
  const setWhitelabelId = (whiteLabelId) =>
    dispatch({ type: actionTypes.SET_WHITELABEL_ID, id: whiteLabelId });

  const setClientToken = (token) => {
    dispatch({ type: actionTypes.SET_CLIENT_TOKEN, token });
  };

  const setBankToken = (bankToken, requestId) => {
    dispatch({ type: actionTypes.SET_BANK_TOKEN, bankToken, requestId });
  };
  const setLogo = (logo) => dispatch({ type: actionTypes.SET_LOGO, logo });

  return {
    setWhitelabelId,
    setClientToken,
    setBankToken,
    setLogo,
  };
};

function reducer(state, action) {
  let updatedState = state;

  switch (action.type) {
    case actionTypes.SET_WHITELABEL_ID: {
      updatedState = { ...state, whiteLabelId: action.id };
      break;
    }

    case actionTypes.SET_CLIENT_TOKEN: {
      updatedState = { ...state, clientToken: action.token };
      break;
    }

    case actionTypes.SET_BANK_TOKEN: {
      updatedState = {
        ...state,
        bankToken: action.bankToken,
        bankRequestId: action.requestId,
      };
      break;
    }

    case actionTypes.SET_LOGO: {
      updatedState = {
        ...state,
        logo: action.logo,
      };
      break;
    }

    default: {
      updatedState = { ...state };
      break;
    }
  }

  setStore(updatedState, APP_REDUCER);

  return updatedState;
}

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    ...storeData,
  });
  const actions = useActions(dispatch);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
