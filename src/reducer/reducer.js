const actionTypes = {
  SET_WHITELABEL_ID: "SET_WHITELABEL_ID",
  SET_CLIENT_TOKEN: "SET_CLIENT_TOKEN",
  SET_LOGO: "SET_LOGO",
  SET_USERID: "SET_USERID",
};

const INITIAL_STATE = {
  userId: null,
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

  const setUserId = (userId) =>
    dispatch({ type: actionTypes.SET_USERID, userId });

  return {
    setWhitelabelId,
    setClientToken,
    setLogo,
    setUserId,
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

    case actionTypes.SET_USERID: {
      return {
        ...state,
        userId: action.userId,
      };
    }

    default: {
      return { ...state };
    }
  }
}

export { reducer, useActions, actionTypes, INITIAL_STATE };
