import { Suspense, lazy } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import Loading from "./Loading";
import CustomerStoreProvider from "../_hoc/customerStoreProviders";

const Products = lazy(() => import("../pages/products/Products"));
const Product = lazy(() => import("../pages/product/Product"));

export default function ApplyLoanContent() {
  const { path } = useRouteMatch();
  return (
    <CustomerStoreProvider>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route
            path={`${path}/product/:product`}
            component={({ match }) => (
              <Product product={match.params.product} url={match.url} />
            )}
          />
          <Route exact path={`${path}`} component={Products} />
        </Switch>
      </Suspense>
    </CustomerStoreProvider>
  );
}
