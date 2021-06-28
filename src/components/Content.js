import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Loading from "./Loading";

const Products = lazy(() => import("../pages/products/Products"));
const Product = lazy(() => import("../pages/product/Product"));

export default function Content() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route exact path="/applyloan" component={Products} />
            <Route
              path="/product/:product"
              component={({ match }) => (
                <Product product={match.params.product} url={match.url} />
              )}
            />
            <Route render={() => <Redirect to="/applyloan" />} />
          </Switch>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
