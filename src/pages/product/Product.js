import { Suspense, lazy, useContext, useState } from "react";
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
import configureFlow from "../../utils/configureFlow";
import Loading from "../../components/Loading";
import FlowRoutes from "./ProductRoutes";
import CheckBox from "../../shared/components/Checkbox/CheckBox";

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

export default function Product({ product, page }) {
  const history = useHistory();

  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  let { response } = useFetch({
    url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
    options: { method: "GET" },
  });

  let { path } = useRouteMatch();

  const h = history.location.pathname.split("/");
  const activeValue = history.location.pathname.split("/").pop();

  const [completedMenu, setCompletedMenu] = useState([]);

  const onComplete = (menu) => {
    setCompletedMenu([...completedMenu, menu]);
  };

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
            <>
              <Link to={`/product/${product}/${m.id}`} key={uuidv4()}>
                <Menu active={h.includes(m.id)} completed={m.completed}>
                  <div>{m.name}</div>
                  {completedMenu.includes(m.id) && (
                    <CheckBox bg="white" checked round fg={"blue"} />
                  )}
                </Menu>
              </Link>
              {m.flow &&
                m.activated &&
                m.flow.map((item) => (
                  <Link to={`/product/${product}/${m.id}/${item.id}`}>
                    <SubMenu
                      active={h.includes(item.id)}
                      completed={item.completed}
                    >
                      <div>{item.name}</div>
                      {item.completed && (
                        <CheckBox bg="white" checked round fg={"blue"} />
                      )}
                    </SubMenu>
                  </Link>
                ))}
            </>
          ))}
        </Colom1>
        <Colom2>
          <Suspense fallback={<Loading />}>
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
            {configureFlow(response?.data?.product_details?.flow)?.map((m) => (
              <>
                <FlowRoutes
                  key={m.id}
                  config={m}
                  productDetails={response?.data?.product_details}
                  pageName={m.name}
                  onComplete={onComplete}
                />
              </>
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

{
  /* 
              <Route
                path={`${path}/2`}
                component={() => (
                  <IdentityVerification
                    loanDetails={response.data.product_details}
                    pageName={pageName}
                  />
                )}
              />

              <Route
                path={`${path}/3`}
                component={() => (
                  <PersonalDetails data={response.data} pageName={pageName} />
                )}
              />

              <Route
                path={`${path}/6`}
                component={() => (
                  <DocumentUpload
                    loanDetails={response.data.product_details}
                    footer={true}
                    pageName={pageName}
                    submitHandler={() => submitHandler()}
                    submit={true}
                  />
                )}
              />

              <Route
                path={`${path}/4`}
                exact
                component={() => (
                  <AddressDetails
                    coApplicant={coApplicant}
                    click={() => subTypeHandler("co-applicants")}
                    loanDetails={response.data.product_details}
                    pageName={pageName}
                    addedApplicant={addedApplicant}
                  />
                )}
              />

              <Route
                path={`${path}/4/co-applicants/1`}
                component={() => (
                  <SubType
                    type="co-applicants"
                    coApplicant={coApplicant}
                    loanDetails={response.data.product_details.step}
                    pageName={pageName}
                    click={() => subTypeHandler("co-applicants")}
                    cancel={true}
                  />
                )}
              />

              <Route
                path={`${path}/4/co-applicants/2`}
                component={() => (
                  <SubTypeIncome
                    type="co-applicants"
                    coApplicant={coApplicant}
                    loanDetails={response.data.product_details.step}
                    pageName={pageName}
                    click={() => subTypeHandler("co-applicants")}
                    cancel={true}
                  />
                )}
              />

              <Route
                path={`${path}/4/co-applicants/3`}
                component={() => (
                  <SubTypeDocs
                    type="co-applicants"
                    coApplicant={coApplicant}
                    loanDetails={response.data.product_details.step}
                    pageName={pageName}
                    click={() => subTypeHandler("co-applicants")}
                    cancel={true}
                    submitHandler={() => submitHandler("co-applicants")}
                    submit={true}
                  />
                )}
              />

              <Route
                path={`${path}/5`}
                component={() => (
                  <LoanDetailsComponent
                    loanDetails={response.data.product_details}
                    footer={true}
                    pageName={pageName}
                  />
                )}
              />

              <Route
                path={`${path}/7`}
                component={() => (
                  <ApplicationSubmitted
                    loanDetails={response.data.product_details}
                    footer={true}
                    pageName={pageName}
                    click={() => subTypeHandler("gurantor")}
                  />
                )}
              /> */
}
