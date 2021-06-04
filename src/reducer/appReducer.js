import { createContext, useReducer } from "react";

const actionTypes = {
  SET_WHITELABEL_ID: "SET_WHITELABEL_ID",
  SET_CLIENT_TOKEN: "SET_CLIENT_TOKEN",
  SET_LOGO: "SET_LOGO",
};

const INITIAL_STATE = {
  whiteLabelId: null,
  clientToken: null,
  logo: null,
};

const useActions = (dispatch) => {
  const setWhitelabelId = (whiteLabelId) =>
    dispatch({ type: actionTypes.SET_WHITELABEL_ID, id: whiteLabelId });

  const setClientToken = (token) => {
    dispatch({ type: actionTypes.SET_CLIENT_TOKEN, token });
  };

  const setLogo = (logo) => dispatch({ type: actionTypes.SET_LOGO, logo });

  return {
    setWhitelabelId,
    setClientToken,
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
