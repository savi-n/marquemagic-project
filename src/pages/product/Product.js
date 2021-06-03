import { Suspense, lazy, useContext, useEffect, Fragment } from "react";
import {
  Route,
  useRouteMatch,
  Link,
  useHistory,
  Redirect,
} from "react-router-dom";
import { string } from "prop-types";
import styled from "styled-components";

import { v4 as uuidv4 } from "uuid";
import { PRODUCT_DETAILS_URL } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import { StoreContext } from "../../utils/StoreProvider";
import { FlowContext } from "../../reducer/flowReducer";
import configureFlow from "../../utils/configureFlow";
import Loading from "../../components/Loading";
import FlowRoutes from "./ProductRoutes";
import CheckBox from "../../shared/components/Checkbox/CheckBox";
import ScrollToTop from "../../utils/ScrollToTop";

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
  /* height: calc(100vh - 80px); */
`;

const Colom2 = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.themeColor1};
  display: flex;
  /* height: calc(100vh - 80px); */
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Head = styled.h4`
  border: ${({ active }) => (active ? "1px solid" : "none")};
  border-radius: 10px;
  padding: 10px 20px;
  margin: 5px 0;
`;

const Menu = styled.h5`
  border: ${({ active }) => (active ? "1px solid" : "none")};
  border-radius: 10px;
  padding: 10px 20px;
  margin: 5px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SubMenu = styled.h5`
  background: ${({ active }) =>
    active ? "rgba(255,255,255,0.2)" : "transparent"};
  border-radius: 10px;
  padding: 10px 20px;
  margin: 5px 0;
  margin-left: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProductDetails = lazy(() => import("./productDetails/ProductDetails"));

export default function Product({ product, url }) {
  const history = useHistory();

  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  const {
    state: { completed: completedMenu, activeSubFlow: subFlowMenu },
    actions: { configure },
  } = useContext(FlowContext);

  const { response } = useFetch({
    url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
    options: { method: "GET" },
  });

  useEffect(() => {
    if (response) configure(response.data?.product_details?.flow);
  }, [response]);

  const { path } = useRouteMatch();

  const h = history.location.pathname.split("/");
  const activeValue = history.location.pathname.split("/").pop();

  return (
    response &&
    response.data && (
      <Wrapper>
        <Colom1>
          <Link to={`/product/${product}/`}>
            <Head active={activeValue === ""}>
              {response.data.name} <small>{response.data.description}</small>
            </Head>
          </Link>
          {response?.data?.product_details?.flow?.map((m) => (
            <Fragment key={uuidv4()}>
              <Link to={`/product/${product}/${m.id}`}>
                <Menu active={h.includes(m.id)}>
                  <div>{m.name}</div>
                  {completedMenu.includes(m.id) && (
                    <CheckBox bg="white" checked round fg={"blue"} />
                  )}
                </Menu>
              </Link>
              {m.flow &&
                subFlowMenu.includes(m.id) &&
                m.flow.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${product}/${m.id}/${item.id}`}
                  >
                    <SubMenu active={h.includes(item.id)}>
                      <div>{item.name}</div>
                      {completedMenu.includes(item.id) && (
                        <CheckBox bg="white" checked round fg={"blue"} />
                      )}
                    </SubMenu>
                  </Link>
                ))}
            </Fragment>
          ))}
        </Colom1>
        <Colom2>
          <Suspense fallback={<Loading />}>
            <ScrollToTop />
            <Route
              exact
              path={`${path}/`}
              component={() => (
                <ProductDetails
                  nextFlow={
                    response?.data?.product_details?.flow?.[0]?.id ?? null
                  }
                  productDetails={response.data.product_details}
                />
              )}
            />
            {response?.data?.product_details?.flow?.map((m) => (
              <FlowRoutes
                key={m.id}
                config={m}
                productDetails={response?.data?.product_details}
              />
            ))}
            {/* <Redirect to={`${path}/`} /> */}
          </Suspense>
        </Colom2>
      </Wrapper>
    )
  );
}

Product.propTypes = {
  product: string.isRequired,
};
