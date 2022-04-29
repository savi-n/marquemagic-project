import { createContext, useReducer } from 'react';

const actionTypes = {
	SET_COMPANY_DETAILS: 'SET_BUSSINESS_DETAILS',
};

const INITIAL_STATE = {
	companyDetail: null,
};

const useActions = dispatch => {
	const setCompanyDetails = companyDetail => {
		dispatch({ type: actionTypes.SET_COMPANY_DETAILS, companyDetail });
	};

	return {
		setCompanyDetails,
	};
};

function reducer(state, action) {
	switch (action.type) {
		case actionTypes.SET_COMPANY_DETAILS: {
			sessionStorage.setItem(
				'companyData',
				JSON.stringify(action.companyDetail)
			);
			return {
				...state,
				companyDetail: action.companyDetail,
			};
		}

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
