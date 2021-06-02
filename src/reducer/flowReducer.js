import { createContext, useReducer } from "react";

const actionTypes = {
  SET_COMPLETED: "SET_COMPLETED",
  ACTIVATE_SUB_FLOW: "ACTIVATE_SUB_FLOW",
};

const INITIAL_STATE = {
  completed: [],
  activeSubFlow: [],
};

const useActions = (dispatch) => {
  const setCompleted = (flow) => {
    dispatch({ type: actionTypes.SET_COMPLETED, flow });
  };

  const activateSubFlow = (flow) => {
    dispatch({ type: actionTypes.ACTIVATE_SUB_FLOW, flow });
  };

  return {
    setCompleted,
    activateSubFlow,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_COMPLETED: {
      return {
        ...state,
        completed: [...state.completed, action.flow],
      };
    }

    case actionTypes.ACTIVATE_SUB_FLOW: {
      return {
        ...state,
        activeSubFlow: [...state.activeSubFlow, action.flow],
      };
    }

    default: {
      return { ...state };
    }
  }
}

const FlowContext = createContext();

const FlowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <FlowContext.Provider value={{ state, actions }}>
      {children}
    </FlowContext.Provider>
  );
};

export { FlowContext, FlowProvider };
