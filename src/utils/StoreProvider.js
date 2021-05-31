import { createContext, useReducer } from "react";
import { element, string, shape, number } from "prop-types";

import { reducer, INITIAL_STATE, useActions } from "../reducer/reducer";

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: element,
  state: shape({
    whiteLabelId: number.isRequired,
    logo: string,
  }),
};

export { StoreContext, StoreProvider };
