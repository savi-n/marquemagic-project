import { createContext, useReducer } from "react";

import { setStore, getStore } from "../utils/localStore";

const CASE_REDUCER = "caseReducer";

const storeData = getStore()[CASE_REDUCER] || {};

const actionTypes = {
  SET_CASE_DETAILS: "SET_CASE_DETAILS",
};

const INITIAL_STATE = {
  caseDetails: null,
};

const useActions = (dispatch) => {
  const setCase = (caseDetails) => {
    dispatch({ type: actionTypes.SET_CASE_DETAILS, caseDetails });
  };

  return { setCase };
};

function reducer(state, action) {
  let updatedState = state;

  switch (action.type) {
    case actionTypes.SET_CASE_DETAILS: {
      updatedState = {
        ...state,
        caseDetails: action.caseDetails,
      };
      break;
    }

    default: {
      updatedState = { ...state };
      break;
    }
  }

  setStore(updatedState, CASE_REDUCER);

  return updatedState;
}

const CaseContext = createContext();

const CaseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    ...storeData,
  });
  const actions = useActions(dispatch);

  return (
    <CaseContext.Provider value={{ state, actions }}>
      {children}
    </CaseContext.Provider>
  );
};

export { CaseContext, CaseProvider };
