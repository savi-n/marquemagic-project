import { createContext, useReducer } from "react";

const actionTypes = {
  SET_BRANCH_USER_TOKEN: "SET_BRANCH_USER_TOKEN",
};

const INITIAL_STATE = {
  userToken: null,
};

const useActions = (dispatch) => {
  const setBranchUserToken = (token) =>
    dispatch({ type: actionTypes.SET_BRANCH_USER_TOKEN, token });

  return { setBranchUserToken };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_BRANCH_USER_TOKEN: {
      return { ...state, userToken: action.token };
    }

    default: {
      return { ...state };
    }
  }
}

const BranchUserContext = createContext();

const BranchUserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });

  const actions = useActions(dispatch);

  return (
    <BranchUserContext.Provider value={{ state, actions }}>
      {children}
    </BranchUserContext.Provider>
  );
};

export { BranchUserProvider, BranchUserContext };
