import { Suspense, lazy, useContext } from "react";
import { Route, Switch, useRouteMatch, Link } from "react-router-dom";
import { string } from "prop-types";
import styled from "styled-components";

import { v4 as uuidv4 } from "uuid";

import { PRODUCT_DETAILS_URL, API_END_POINT } from "../config";
import useFetch from "../hooks/useFetch";
import { StoreContext } from "../utils/StoreProvider";
import Loading from "../components/Loading";
import CheckBox from "../shared/components/Checkbox/CheckBox";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Colom1 = styled.div`
  width: 25%;
  background: ${({ theme }) => theme.buttonColor1};
  color: ${({ theme }) => theme.themeColor1};
  padding: 50px 20px;
`;

const Colom2 = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.themeColor1};
  display: flex;
`;

const Head = styled.h4`
  border: ${({ active }) => (active ? "1px solid" : "none")};
  border-radius: 10px;
  padding: 15px 20px;
  margin: 10px 0;
`;

const Menu = styled.h5`
  border: ${({ active }) => (active ? "1px solid" : "none")};
  border-radius: 10px;
  padding: 15px 20px;
  margin: 10px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LoanDetails = lazy(() => import("../pages/ProductDetails"));
const IdentityVerification = lazy(() =>
  import("../pages/IdentityVerification")
);
const DocumentUpload = lazy(() => import("../pages/DocumentUpload"));
const LoanForm = lazy(() => import("../pages/LoanDetails"));

export default function Product({ product, page }) {
  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  const { response } = useFetch({
    url: PRODUCT_DETAILS_URL({
      whiteLabelId,
      productId: atob(product),
    }),
  });

  let { path } = useRouteMatch();

  const h = window.location.href.split("/");
  const activeValue = Number(h[h.length - 1]) ? h[h.length - 1] : "1";
  const getPageName = (loanDetails) =>
    loanDetails.step.filter((el) => h[h.length - 1] === el.page);
  const pageName =
    response &&
    response.data &&
    getPageName(response.data.product_details)[0]?.name;

  return (
    response &&
    response.data && (
      <Wrapper>
        <Colom1>
          <Link to={`/product/${product}`}>
            <Head active={activeValue === "1"}>
              {response.data.name} <small>{response.data.description}</small>
            </Head>
          </Link>
          {response?.data?.product_details?.step?.map((m) => (
            <Link to={`/product/${product}/${m.page}`} key={uuidv4()}>
              <Menu
                active={activeValue === m.page.toString()}
                completed={activeValue === (Number(m.page) + 1).toString()}
              >
                <div>{m.name}</div>
                {!!m.subStep && (
                  <CheckBox bg="white" checked round fg={"blue"} />
                )}
              </Menu>
            </Link>
          ))}
        </Colom1>
        <Colom2>
          <Suspense fallback={<Loading />}>
            <Switch>
              <Route
                exact
                path={`${path}`}
                component={() => (
                  <LoanDetails loanDetails={response.data.product_details} />
                )}
              />

              <Route
                path={`${path}/2`}
                component={() => (
                  <IdentityVerification
                    loanDetails={response.data.product_details}
                    pageName={pageName}
                  />
                )}
              />
              <Route path={`${path}/5`} component={() => <LoanForm />} />
              <Route
                path={`${path}/6`}
                component={() => (
                  <DocumentUpload
                    loanDetails={response.data.product_details}
                    pageName={pageName}
                  />
                )}
              />
            </Switch>
          </Suspense>
        </Colom2>
      </Wrapper>
    )
  );
}

Product.propTypes = {
  product: string.isRequired,
};
