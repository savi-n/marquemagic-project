import { createContext, useReducer } from "react";

const actionTypes = {
  SET_COMPLETED: "SET_COMPLETED",
  ACTIVATE_SUB_FLOW: "ACTIVATE_SUB_FLOW",
  SET_BASE_PAGE: "SET_BASE_PAGE",
  CONFIGURE_FLOW: "CONFIGURE_FLOW",
};

const INITIAL_STATE = {
  completed: [],
  activeSubFlow: [],
  basePageUrl: null,
  flowMap: null,
};

const useActions = (dispatch) => {
  const setCompleted = (flow) => {
    dispatch({ type: actionTypes.SET_COMPLETED, flow });
  };

  const activateSubFlow = (flow) => {
    dispatch({ type: actionTypes.ACTIVATE_SUB_FLOW, flow });
  };

  const configure = (menu) => {
    const flowMap = {};
    menu.forEach((element, index) => {
      const main = menu[index + 1] ? menu[index + 1].id : null;
      const sub = element.flow ? element.flow?.[0].id : null;
      flowMap[element.id] = {
        main,
        sub,
        fields: element.fields || {},
        name: element.name,
      };

      element.flow?.forEach((e, i) => {
        const m = element.flow[i + 1]
          ? element.flow[i + 1].id
          : menu[index + 1]
          ? menu[index + 1].id
          : element.id;
        const s = menu[index + 1] ? menu[index + 1].id : element.id;
        flowMap[e.id] = { main: m, sub: s, mainPageId: element.id };
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

    case actionTypes.CONFIGURE_FLOW: {
      return {
        ...state,
        basePageUrl: action.basePageUrl,
        flowMap: action.flowMap,
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
