import { createContext, useReducer } from 'react';

const actionTypes = {
	SET_USERID: 'SET_USERID',
	SET_USER_BANK_DETAILS: 'SET_USER_BANK_DETAILS',
	SET_USER_DETAILS: 'SET_USER_DETAILS',
	SET_USER_TOKEN: 'SET_USER_TOKEN'
};

const INITIAL_STATE = {
	userId: null,
	userDetails: null,
	userBankDetails: null,
	userToken: null
};

const useActions = dispatch => {
	const setUserId = userId => dispatch({ type: actionTypes.SET_USERID, userId });

	const setUserDetails = userDetails => dispatch({ type: actionTypes.SET_USER_DETAILS, userDetails });

	return {
		setUserId,
		setUserDetails
	};
};

function reducer(state, action) {
	switch (action.type) {
		case actionTypes.SET_USERID: {
			return {
				...state,
				userId: action.userId
			};
		}

		case actionTypes.SET_USER_DETAILS: {
			return {
				...state,
				userDetails: action.userDetails,
				userBankDetails: action.userBankDetails,
				userToken: action.userToken
			};
		}

		default: {
			return { ...state };
		}
	}
}

const UserContext = createContext();

const UserProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, {
		...INITIAL_STATE
	});
	const actions = useActions(dispatch);

	return <UserContext.Provider value={{ state, actions }}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
