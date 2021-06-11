import { createContext, useReducer } from "react";

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
  bankRequestId: null,
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
  switch (action.type) {
    case actionTypes.SET_WHITELABEL_ID: {
      return { ...state, whiteLabelId: action.id };
    }

    case actionTypes.SET_CLIENT_TOKEN: {
      return { ...state, clientToken: action.token };
    }

    case actionTypes.SET_BANK_TOKEN: {
      return {
        ...state,
        bankToken: action.bankToken,
        bankRequestId: action.requestId,
      };
    }

    case actionTypes.SET_LOGO: {
      return {
        ...state,
        logo: action.logo,
      };
    }

    default: {
      return { ...state };
    }
  }
}

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
