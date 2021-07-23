import { useContext, useEffect, Fragment, useState } from "react";
import { string } from "prop-types";
import styled from "styled-components";

import { PRODUCT_DETAILS_URL } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../reducer/appReducer";
import { FlowContext } from "../../reducer/flowReducer";
import CheckBox from "../../shared/components/Checkbox/CheckBox";
import ContinueModal from "../../components/modals/ContinueModal";
import Router from "./Router";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Colom1 = styled.div`
  width: 25%;
  background: ${({ theme }) => theme.main_theme_color};
  color: #fff;
  padding: 50px 20px;
`;

const Colom2 = styled.div`
  flex: 1;
  background: #fff;
  display: flex;
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
  font-size: 20px;
  font-weight: 500;

  span {
    font-size: 14px;
    font-weight: 400;
  }
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
  font-size: 14px;
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
  font-size: 14px;
`;

const Link = styled.div`
  /* cursor: pointer; */
`;

export default function Product({ product, url }) {
  const productIdPage = atob(product);
  const {
    state: { whiteLabelId },
  } = useContext(AppContext);

  const {
    state: {
      completed: completedMenu,
      activeSubFlow: subFlowMenu,
      flowMap,
      basePageUrl,
      currentFlow,
      productId,
    },
    actions: { configure, setCurrentFlow, clearFlowDetails },
  } = useContext(FlowContext);

  const { response } = useFetch({
    url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
    options: { method: "GET" },
  });

  useEffect(() => {
    if (response) {
      configure(response.data?.product_details?.flow);
    }
  }, [response]);

  useEffect(() => {
    if (productId !== productIdPage) {
      clearFlowDetails();
    }
  }, []);

  // useEffect(() => {
  //   if (basePageUrl) setCurrentFlow(basePageUrl);
  // }, [basePageUrl]);

  const [
    continueExistingApplication,
    setContinueExistingApplication,
  ] = useState(false);

  const [showContinueModal, setShowContinueModal] = useState(false);

  const onYesClick = () => {
    setContinueExistingApplication(true);
    setShowContinueModal(true);
  };

  const onNoClick = () => {
    setContinueExistingApplication(false);
    setShowContinueModal(true);
    clearFlowDetails(basePageUrl);
  };

  const onFlowChange = (flow) => {
    setCurrentFlow(flow, atob(product));
    setShowContinueModal(true);
  };

  const currentFlowDetect = () => {
    if (completedMenu.length && productId === productIdPage) {
      return showContinueModal ? currentFlow : basePageUrl;
    }

    return currentFlow;
  };

  let flow = currentFlowDetect();

  return (
    response &&
    response.data && (
      <Wrapper>
        <Colom1>
          <Link onClick={(e) => {}}>
            <Head active={flow === "product-details"}>
              {response.data.name} <span>{response.data.description}</span>
            </Head>
          </Link>
          {response.data?.product_details?.flow?.map((m) =>
            (!m.hidden || m.id === flow) && m.id !== "product-details" ? (
              <Fragment key={m.id}>
                <Link onClick={(e) => {}}>
                  <Menu active={flow === m.id}>
                    <div>{m.name}</div>
                    {completedMenu.includes(m.id) && (
                      <CheckBox bg="white" checked round fg={"blue"} />
                    )}
                  </Menu>
                </Link>
                {m.flow &&
                  subFlowMenu.includes(m.id) &&
                  m.flow.map((item) => (
                    <Link key={item.id} onClick={(e) => {}}>
                      <SubMenu active={flow === item.id}>
                        <div>{item.name}</div>
                        {completedMenu.includes(item.id) && (
                          <CheckBox bg="white" checked round fg={"blue"} />
                        )}
                      </SubMenu>
                    </Link>
                  ))}
              </Fragment>
            ) : null
          )}
        </Colom1>
        <Colom2>
          <Router
            currentFlow={flow || basePageUrl}
            map={flowMap?.[flow]}
            productDetails={response.data?.product_details}
            onFlowChange={onFlowChange}
            productId={response.data?.product_id}
          />
        </Colom2>
        {!!completedMenu.length &&
          !showContinueModal &&
          productId === productIdPage && (
            <ContinueModal onYes={onYesClick} onNo={onNoClick} />
          )}
      </Wrapper>
    )
  );
}

Product.propTypes = {
  product: string.isRequired,
};
