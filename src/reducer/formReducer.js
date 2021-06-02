import { createContext, useReducer } from "react";

// {
//     "white_label_id": 32,
//     "applicantData": {
//         "firstName": "Anand",
//         "lastName": "an",
//         "panNumber": "bfbsgshj67",
//         "dob": "05-06-1995", // check date format with madhuri
//         "email": "anand.biradar@nc.co",
//         "mobileNo": "55665665",
//         "isApplicant": "0", // can be 1 or 0... 0 for co-applicant. check for garantor with madhuri
//         "address": [{
//             "addressType": "permanent",
//             "address1": "",
//             "address2": "",
//             "address3": "",
//             "address4": "",
//             "city": "",
//             "state": "",
//             "pinCode": ""
//         }, {
//             "addressType": "present",
//             "address1": "",
//             "address2": "",
//             "address3": "",
//             "address4": "",
//             "city": "",
//             "state": "",
//             "pinCode": ""
//         }],
//         "aadhaar": "",
//         "incomeType": "", //['NULL', 'salaried', 'business']
//         "residenceStatus": "", //['NULL', 'Resident', 'Resident and Ordinarily Resident', 'Resident but Not Ordinarily Resident', 'Non-Resident']
//         "countryResidence": "",
//         "maritalStatus": "", //['NULL', 'Single', 'Married', 'Widowed', 'Divorced']
//         "grossIncome": "",
//         "netMonthlyIncome": "",
//         "existing_auto_loan": "",
//         "existing_personal_loan": ""
//         "existing_lap_loan": ""
//     },
//     "loanData": {
//         "loanAmount": "",
//         "tenure": "",
//         "assetsValue": "",
//         "loanTypeId": "",
//         "summary": "",
//         "productId": "",
//     }
// }

const actionTypes = {
  SET_APPLICANT_DATA: "SET_APPLICANT_DATA",
  SET_ADDRESS_DATA: "SET_ADDRESS_DATA",
  SET_LOAN_DATA: "SET_LOAN_DATA",
};

const INITIAL_STATE = {
  applicantData: {},
  loanData: {},
};

const useActions = (dispatch) => {
  const setApplicantData = (applicantData) => {
    dispatch({ type: actionTypes.SET_APPLICANT_DATA, applicantData });
  };

  const setAddressData = (addressData) => {
    dispatch({ type: actionTypes.SET_ADDRESS_DATA, addressData });
  };

  const setLoanData = (loanData) => {
    dispatch({ type: actionTypes.SET_LOAN_DATA, loanData });
  };

  return {
    setApplicantData,
    setAddressData,
    setLoanData,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_APPLICANT_DATA: {
      return {
        ...state,
        applicantData: { ...state.applicantData, ...action.applicantData },
      };
    }

    case actionTypes.SET_ADDRESS_DATA: {
      return {
        ...state,
        applicantData: { ...state.applicantData, address: action.addressData },
      };
    }

    case actionTypes.SET_LOAN_DATA: {
      return {
        ...state,
        loanData: action.loanData,
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
