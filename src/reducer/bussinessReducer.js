import { createContext, useReducer } from "react";

const actionTypes = {
  SET_COMPANY_DETAILS: "SET_BUSSINESS_DETAILS",
  // SET_USER_BANK_DETAILS: "SET_USER_BANK_DETAILS",
  // SET_USER_DETAILS: "SET_USER_DETAILS",
  // SET_USER_TOKEN: "SET_USER_TOKEN",
  // SET_OTHER_USER_TOKEN: "SET_OTHER_USER_TOKEN",
};

const INITIAL_STATE = {
  companyDetail: null,
};

const useActions = (dispatch) => {
  const setCompanyDetails = (companyDetail) => {
    dispatch({ type: actionTypes.SET_COMPANY_DETAILS, companyDetail });
  };

  return {
    setCompanyDetails,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_COMPANY_DETAILS: {
      return {
        ...state,
        companyDetail: action.companyDetail,
      };
    }

    // case actionTypes.SET_USER_DETAILS: {
    //   return {
    //     ...state,
    //     userDetails: action.data.userDetails,
    //     userBankDetails: action.data.userBankDetails,
    //     userAccountToken: action.data.userAccountToken,
    //     userToken: action.data.userToken,
    //   };
    // }

    // case actionTypes.SET_OTHER_USER_TOKEN: {
    //   return {
    //     ...state,
    //     [action.userType]: action.data,
    //   };
    // }

    default: {
      return { ...state };
    }
  }
}

const BussinesContext = createContext();

const BussinesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <BussinesContext.Provider value={{ state, actions }}>
      {children}
    </BussinesContext.Provider>
  );
};

export { BussinesContext, BussinesProvider };
