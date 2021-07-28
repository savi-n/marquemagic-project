import { createContext, useReducer } from "react";

import { setStore, getStore } from "../utils/localStore";

const FORM_REDUCER = "formReducer";

const storeData = getStore()[FORM_REDUCER] || {};

const actionTypes = {
  SET_USERTYPE_APPLICANT_DATA: "SET_USERTYPE_APPLICANT_DATA",
  SET_USERTYPE_ADDRESS_DATA: "SET_USERTYPE_ADDRESS_DATA",
  SET_USERTYPE_LOAN_DATA: "SET_USERTYPE_LOAN_DATA",
  SET_USERTYPE_EMI_DATA: "SET_USERTYPE_EMI_DATA",
  SET_USERTYPE_SALARY_DATA: "SET_USERTYPE_SALARY_DATA",
  SET_USERTYPE_DOCUMENTS: "SET_USERTYPE_DOCUMENTS",
  SET_USERTYPE_BANK_DATA: "SET_USERTYPE_BANK_DATA",

  SET_USERTYPE_CIBIL_DATA: "SET_USERTYPE_CIBIL_DATA",
  SET_USERTYPE_CUB_STATEMENT_DATA: "SET_USERTYPE_CUB_STATEMENT_DATA",
  SET_USERTYPE_AGREEMENT_DOCS: "SET_USERTYPE_AGREEMENT_DOCS",

  SET_USERTYPE_DOCUMENT_TYPE: "SET_USERTYPE_DOCUMENT_TYPE",
  REMOVE_USERTYPE_DOCUMENT: "REMOVE_USERTYPE_DOCUMENT",

  CLEAR_FORM: "CLEAR_FORM",
};

const INIT_ROLE_DATA_TYPES = {
  bankData: {},
  applicantData: {},
  loanData: {},
  uploadedDocs: [],
  cibilData: {},
  cubStatement: {},
  otherBankStatement: {},
};

const INITIAL_STATE = {
  user: INIT_ROLE_DATA_TYPES,
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

  const setUsertypeCibilData = (cibilData, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_CIBIL_DATA,
      cibilData,
      userType,
    });
  };

  const setUsertypeStatementData = (statement, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_CUB_STATEMENT_DATA,
      statement,
      userType,
    });
  };

  const setUsertypeAgreementData = (agreementFiles, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_AGREEMENT_DOCS,
      agreementFiles,
      userType,
    });
  };

  const removeUserTypeDocument = (docId, userType = "user") => {
    dispatch({
      type: actionTypes.REMOVE_USERTYPE_DOCUMENT,
      docId,
      userType,
    });
  };

  const setUserTypeDocumentType = (docId, docType, userType = "user") => {
    dispatch({
      type: actionTypes.SET_USERTYPE_DOCUMENT_TYPE,
      docId,
      docType,
      userType,
    });
  };

  const clearFormData = () => {
    dispatch({
      type: actionTypes.CLEAR_FORM,
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
    setUsertypeCibilData,
    setUsertypeStatementData,
    setUsertypeAgreementData,
    removeUserTypeDocument,
    setUserTypeDocumentType,
    clearFormData,
  };
};

function reducer(state, action) {
  let updatedState = state;

  switch (action.type) {
    case actionTypes.CLEAR_FORM: {
      updatedState = {
        ...INITIAL_STATE,
      };
      break;
    }
    case actionTypes.SET_USERTYPE_AGREEMENT_DOCS: {
      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          uploadedDocs: [
            ...state[action.userType].uploadedDocs,
            ...action.agreementFiles,
          ],
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_CUB_STATEMENT_DATA: {
      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          cubStatement: action.statement,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_DOCUMENT_TYPE: {
      const userDocs = (state[action.userType]?.uploadedDocs || []).map((doc) =>
        doc.id === action.docId
          ? {
              ...doc,
              ...(action.docType?.value
                ? { typeId: action.docType.value }
                : {}),

              ...(action.docType?.name
                ? { typeName: action.docType.name }
                : {}),
              ...(action.docType?.main
                ? { mainType: action.docType.main }
                : {}),
              ...(action.docType?.password
                ? { password: action.docType.password }
                : {}),
            }
          : doc
      );

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          uploadedDocs: userDocs,
        },
      };
      break;
    }

    case actionTypes.REMOVE_USERTYPE_DOCUMENT: {
      const userDocs = (state[action.userType]?.uploadedDocs || []).filter(
        (doc) => doc.id !== action.docId
      );

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          uploadedDocs: userDocs,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_CIBIL_DATA: {
      const cibilData = {
        ...(state[action.userType]?.cibilData || {}),
        ...action.cibilData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          cibilData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_APPLICANT_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        ...action.applicantData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_ADDRESS_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        address: action.addressData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_EMI_DATA: {
      // const applicantData = {
      //   ...(state[action.userType]?.applicantData || {}),
      //   emi: action.emiData,
      // };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          emi: action.emiData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_BANK_DATA: {
      const bankData = {
        ...(state[action.userType]?.bankData || {}),
        ...action.bankData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          bankData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_SALARY_DATA: {
      const applicantData = {
        ...(state[action.userType]?.applicantData || {}),
        ...action.salaryData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          applicantData,
        },
      };
      break;
    }

    case actionTypes.SET_USERTYPE_LOAN_DATA: {
      const loanData = {
        ...(state[action.userType]?.loanData || {}),
        ...action.loanData,
      };

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          loanData,
        },
      };
      break;
    }
    case actionTypes.SET_USERTYPE_DOCUMENTS: {
      const uploadedDocs = [
        ...(state[action.userType]?.uploadedDocs || []),
        ...action.docs,
      ];

      updatedState = {
        ...state,
        [action.userType]: {
          ...state[action.userType],
          uploadedDocs,
        },
      };
      break;
    }

    default: {
      updatedState = { ...state };
      break;
    }
  }

  setStore(updatedState, FORM_REDUCER);

  return updatedState;
}

const FormContext = createContext();

const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    ...storeData,
  });
  const actions = useActions(dispatch);

  return (
    <FormContext.Provider value={{ state, actions }}>
      {children}
    </FormContext.Provider>
  );
};

export { FormContext, FormProvider };
