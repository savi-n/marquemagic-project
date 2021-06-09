import { createContext, useReducer } from "react";

const actionTypes = {
  SET_USERTYPE_APPLICANT_DATA: "SET_USERTYPE_APPLICANT_DATA",
  SET_USERTYPE_ADDRESS_DATA: "SET_USERTYPE_ADDRESS_DATA",
  SET_USERTYPE_LOAN_DATA: "SET_USERTYPE_LOAN_DATA",
  SET_USERTYPE_EMI_DATA: "SET_USERTYPE_EMI_DATA",
  SET_USERTYPE_SALARY_DATA: "SET_USERTYPE_SALARY_DATA",
  SET_USERTYPE_DOCUMENTS: "SET_USERTYPE_DOCUMENTS",
  SET_USERTYPE_BANK_DATA: "SET_USERTYPE_BANK_DATA",
};

const INITIAL_STATE = {
  user: {
    bankData: {},
    applicantData: {},
    loanData: {},
    docs: [],
  },
  coapplicant: null,
  guarantor: null,
};

const useActions = (dispatch) => {
  const setUsertypeApplicantData = (applicantData, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_APPLICANT_DATA,
      applicantData,
      userType,
    });
  };

  const setUsertypeAddressData = (addressData, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_ADDRESS_DATA,
      addressData,
      userType,
    });
  };

  const setUsertypeLoanData = (loanData, userType = "user") => {
    dispatch({ type: actionTypes.SET_USERTYPE_LOAN_DATA, loanData, userType });
  };

  const setUsertypeDocuments = (docs, userType = "user") => {
    dispatch({ type: actionTypes.SET_USERTYPE_DOCUMENTS, docs, userType });
  };

  const setUsertypeEmiData = (emiData, userType = "user") => {
    dispatch({ type: actionTypes.SET_USERTYPE_EMI_DATA, emiData, userType });
  };

  const setUsertypeBankData = (bankData, userType = "user") => {
    dispatch({ type: actionTypes.SET_USERTYPE_BANK_DATA, bankData, userType });
  };

  const setUsertypeSalaryData = (salaryData, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_SALARY_DATA,
      salaryData,
      userType,
    });
  };

  return {
    setUsertypeApplicantData,
    setUsertypeAddressData,
    setUsertypeLoanData,
    setUsertypeEmiData,
    setUsertypeSalaryData,
    setUsertypeDocuments,
    setUsertypeBankData,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USERTYPE_APPLICANT_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        ...action.applicantData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
    }

    case actionTypes.SET_USERTYPE_ADDRESS_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        address: action.addressData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
    }

    case actionTypes.SET_USERTYPE_EMI_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        ...action.emiData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
    }

    case actionTypes.SET_USERTYPE_BANK_DATA: {
      const bankData = {
        ...(state[action.userType]?.bankData || {}),
        ...action.bankData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          bankData,
        },
      };
    }

    case actionTypes.SET_USERTYPE_SALARY_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        ...action.salaryData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
    }

    case actionTypes.SET_USERTYPE_LOAN_DATA: {
      const loanData = {
        ...(state[action.userType]?.loanData || {}),
        ...action.loanData,
      };

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          loanData,
        },
      };
    }
    case actionTypes.SET_USERTYPE_DOCUMENTS: {
      const docs = [...(state[action.userType]?.docs || []), ...action.docs];

      return {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          docs,
        },
      };
    }

    default: {
      return { ...state };
    }
  }
}

const FormContext = createContext();

const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <FormContext.Provider value={{ state, actions }}>
      {children}
    </FormContext.Provider>
  );
};

export { FormContext, FormProvider };
