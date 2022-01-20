import { createContext, useReducer } from 'react';

import { setStore, getStore } from '../utils/localStore';

const USER_REDUCER = 'userReducer';

const actionTypes = {
	SET_USERID: 'SET_USERID',
	SET_USER_BANK_DETAILS: 'SET_USER_BANK_DETAILS',
	SET_USER_DETAILS: 'SET_USER_DETAILS',
	SET_USER_TOKEN: 'SET_USER_TOKEN',
	SET_OTHER_USER_TOKEN: 'SET_OTHER_USER_TOKEN',
	RESET_USER_DETAILS: 'RESET_USER_DETAILS',
};

const storeData = getStore()[USER_REDUCER] || {};

const INITIAL_STATE = {
	userId: null,
	userDetails: null,
	userBankDetails: null,
	userAccountToken: null,
	userToken: null, // ACCOUNT TOKEN
	coapplicant: null,
	gurantor: null,
};

const useActions = dispatch => {
	const setUserId = userId => {
		dispatch({ type: actionTypes.SET_USERID, userId });
	};

	const setUserDetails = userDetails => {
		dispatch({ type: actionTypes.SET_USER_DETAILS, data: userDetails });
	};

	const setOtherUserDetails = (userDetails, userType) => {
		dispatch({
			type: actionTypes.SET_OTHER_USER_TOKEN,
			data: userDetails,
			userType,
		});
	};

	const resetUserDetails = () => {
		dispatch({
			type: actionTypes.RESET_USER_DETAILS,
		});
	};
	return {
		setUserId,
		setUserDetails,
		setOtherUserDetails,
		resetUserDetails,
	};
};

function reducer(state, action) {
	let updatedState = state;
	switch (action.type) {
		case actionTypes.SET_USERID: {
			updatedState = {
				...state,
				userId: action.userId,
			};
			break;
		}

		case actionTypes.SET_USER_DETAILS: {
			let tokenValidTill = new Date();
			tokenValidTill.setDate(tokenValidTill.getDate() + 1);

			updatedState = {
				...state,
				...action.data,
				userDetails: action.data.userDetails,
				userBankDetails: action.data.userBankDetails,
				userAccountToken: action.data.userAccountToken,
				userToken: action.data.userToken,
				timestamp: tokenValidTill,
			};
			break;
		}

		case actionTypes.SET_OTHER_USER_TOKEN: {
			updatedState = {
				...state,
				[action.userType]: action.data,
			};
			break;
		}

		case actionTypes.RESET_USER_DETAILS: {
			updatedState = {
				...INITIAL_STATE,
			};
			break;
		}

		default: {
			updatedState = { ...state };
			break;
		}
	}

	setStore(updatedState, USER_REDUCER);

	return updatedState;
}

const UserContext = createContext();

const UserProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, {
		...INITIAL_STATE,
		...storeData,
	});
	const actions = useActions(dispatch);

	return (
		<UserContext.Provider value={{ state, actions }}>
			{children}
		</UserContext.Provider>
	);
};

export { UserContext, UserProvider };
