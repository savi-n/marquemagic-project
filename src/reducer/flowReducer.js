import { set } from 'lodash';
import { createContext, useReducer } from 'react';

import { setStore, getStore } from '../utils/localStore';

const FLOW_REDUCER = 'flowReducer';

const storeData = getStore()[FLOW_REDUCER] || {};

const actionTypes = {
	SET_COMPLETED: 'SET_COMPLETED',
	ACTIVATE_SUB_FLOW: 'ACTIVATE_SUB_FLOW',
	SET_BASE_PAGE: 'SET_BASE_PAGE',
	CONFIGURE_FLOW: 'CONFIGURE_FLOW',
	SET_CURRENT_FLOW: 'SET_CURRENT_FLOW',
	CLEAR_FLOW: 'CLEAR_FLOW',
};

const INITIAL_STATE = {
	completed: [],
	activeSubFlow: [],
	basePageUrl: null,
	flowMap: null,
	currentFlow: '',
	productId: null,
};

const useActions = dispatch => {
	const setCompleted = flow => {
		dispatch({ type: actionTypes.SET_COMPLETED, flow });
	};

	const activateSubFlow = flow => {
		dispatch({ type: actionTypes.ACTIVATE_SUB_FLOW, flow });
	};

	const clearFlowDetails = () => {
		dispatch({ type: actionTypes.CLEAR_FLOW });
	};

	const setCurrentFlow = (flow, productId) => {
		dispatch({ type: actionTypes.SET_CURRENT_FLOW, flow, productId });
	};

	const configure = menu => {
		const flowMap = {};
		menu.forEach((element, index) => {
			let main = menu[index + 1] ? menu[index + 1].id : null;
			const sub = element.flow?.length ? element.flow?.[0].id : null;
			let hidden;
			if (menu[index + 1]?.hidden) {
				main = menu[index + 2].id || null;
				hidden = menu[index + 1].id || null;
			}
			flowMap[element.id] = {
				main,
				sub,
				hidden,
				fields: element.fields || {},
				name: element.name,
				actions: element.actions || {},
			};

			element.flow?.forEach((e, i) => {
				let m = element.flow[i + 1]
					? element.flow[i + 1].id
					: menu[index + 1]
					? menu[index + 1].id
					: element.id;
				let s = menu[index + 1] ? menu[index + 1].id : element.id;
				let h;
				if (menu[index + 1]?.hidden) {
					s = menu[index + 2].id || null;
					h = menu[index + 1].id || null;
				}

				flowMap[e.id] = {
					main: m,
					sub: s,
					hidden: h,
					mainPageId: element.id,
					fields: e.fields || {},
					name: e.name,
					actions: e.actions || {},
				};
			});
		});

		dispatch({
			type: actionTypes.CONFIGURE_FLOW,
			flowMap,
			basePageUrl: menu[0]?.id,
		});
	};

	return {
		setCompleted,
		activateSubFlow,
		configure,
		setCurrentFlow,
		clearFlowDetails,
	};
};

function reducer(state, action) {
	let updatedState = state;

	switch (action.type) {
		case actionTypes.CLEAR_FLOW: {
			updatedState = {
				...state,
				completed: [],
				activeSubFlow: [],
				currentFlow: state.basePageUrl,
			};
			break;
		}

		case actionTypes.SET_CURRENT_FLOW: {
			updatedState = {
				...state,
				currentFlow: action.flow,
				productId: action.productId,
			};
			break;
		}
		case actionTypes.SET_COMPLETED: {
			updatedState = {
				...state,
				completed: [...state.completed, action.flow],
				completed: [...state.completed, action.flow].filter((c, index) => {
					return [...state.completed, action.flow].indexOf(c) === index;
				}),
			};
			break;
		}

		case actionTypes.ACTIVATE_SUB_FLOW: {
			updatedState = {
				...state,
				activeSubFlow: [...state.activeSubFlow, action.flow],
			};
			break;
		}

		case actionTypes.CONFIGURE_FLOW: {
			updatedState = {
				...state,
				basePageUrl: action.basePageUrl,
				flowMap: action.flowMap,
			};
			break;
		}

		default: {
			updatedState = { ...state };
			break;
		}
	}
	setStore(updatedState, FLOW_REDUCER);

	return updatedState;
}

const FlowContext = createContext();

const FlowProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, {
		...INITIAL_STATE,
		...storeData,
		...(!storeData?.completed?.length && {
			currentFlow: storeData.basePageUrl,
		}),
	});
	const actions = useActions(dispatch);
	return (
		<FlowContext.Provider value={{ state, actions }}>
			{children}
		</FlowContext.Provider>
	);
};

export { FlowContext, FlowProvider };
