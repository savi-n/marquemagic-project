import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { FlowContext } from "../reducer/flowReducer";
import { UserContext } from "../reducer/userReducer";

const ProtectedRoute = ({
  path,
  Component = "",
  children = "",
  protectedRoute,
}) => {
  const {
    state: { basePageUrl },
  } = useContext(FlowContext);

  const {
    state: { userToken },
  } = useContext(UserContext);

  const authorize = !!userToken;
  // if (protectedRoute) {
  //   return (
  //     <Route
  //       exact
  //       path={path}
  //       component={({ match }) =>
  //         authorize ? (
  //           <Component productId={atob(match.params.product)} />
  //         ) : (
  //           <Redirect to={basePageUrl} />
  //         )
  //       }
  //     >
  //       {children}
  //     </Route>
  //   );
  // }
  return (
    <Route
      exact
      path={path}
      component={({ match }) => (
        <Component productId={atob(match.params.product)} />
      )}
    >
      {children}
    </Route>
  );
};

export default ProtectedRoute;
