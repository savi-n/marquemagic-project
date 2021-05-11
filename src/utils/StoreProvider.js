import { createContext } from "react";
import { element, string, shape, number } from 'prop-types';


const StoreContext = createContext();

const StoreProvider = ({ children, state }) => {
    return (
      <StoreContext.Provider value={{ state }}>
        { children}
      </StoreContext.Provider>
    )
  }

  StoreProvider.propTypes = {
    children: element,
    state: shape({
        whiteLabelId: number.isRequired,
        logo: string
    })
};

  
  export { StoreContext, StoreProvider };