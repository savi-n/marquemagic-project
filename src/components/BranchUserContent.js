import { Suspense, lazy } from "react";
import { Route, Switch, useRouteMatch, Redirect } from "react-router-dom";

import Loading from "./Loading";
import BranchStoreProvider from "../_hoc/branchStoreProvider";

const Dashboard = lazy(() => import("../Branch/pages/Dashboard"));
const BranchLogin = lazy(() => import("../Branch/pages/Login"));

export default function BranchUserContent() {
  const { path, url } = useRouteMatch();

  return (
    <BranchStoreProvider>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route
            exact
            path={`${path}/dashboard`}
            manager={true}
            component={Dashboard}
          />
          <Route exact path={`${path}/login`} component={BranchLogin} />
          <Route render={() => <Redirect to={`${url}/login`} />} />
        </Switch>
      </Suspense>
    </BranchStoreProvider>
  );
}
