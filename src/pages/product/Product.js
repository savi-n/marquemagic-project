import { useContext, useEffect, Fragment, useState } from "react";
import { string } from "prop-types";
import styled from "styled-components";

import { v4 as uuidv4 } from "uuid";
import { PRODUCT_DETAILS_URL } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../reducer/appReducer";
import { FlowContext } from "../../reducer/flowReducer";
import CheckBox from "../../shared/components/Checkbox/CheckBox";
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
  const {
    state: { whiteLabelId },
  } = useContext(AppContext);

  const {
    state: {
      completed: completedMenu,
      activeSubFlow: subFlowMenu,
      flowMap,
      basePageUrl,
    },
    actions: { configure },
  } = useContext(FlowContext);

  const { response } = useFetch({
    url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
    options: { method: "GET" },
  });

  useEffect(() => {
    if (response) configure(response.data?.product_details?.flow);
  }, [response]);

  const [currentFlow, setCurrentFlow] = useState("product-details");

  const onFlowChange = (flow) => {
    setCurrentFlow(flow);
  };

  return (
    response &&
    response.data && (
      <Wrapper>
        <Colom1>
          <Link>
            <Head active={currentFlow === "product-details"}>
              {response.data.name} <span>{response.data.description}</span>
            </Head>
          </Link>
          {response?.data?.product_details?.flow?.map((m) => (
            <Fragment key={uuidv4()}>
              <Link>
                <Menu active={currentFlow === m.id}>
                  <div>{m.name}</div>
                  {completedMenu.includes(m.id) && (
                    <CheckBox bg="white" checked round fg={"blue"} />
                  )}
                </Menu>
              </Link>
              {m.flow &&
                subFlowMenu.includes(m.id) &&
                m.flow.map((item) => (
                  <Link key={item.id}>
                    <SubMenu active={currentFlow === item.id}>
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
          <Router
            currentFlow={currentFlow || ""}
            map={flowMap?.[currentFlow] || basePageUrl}
            productDetails={response.data.product_details}
            onFlowChange={onFlowChange}
            productId={product}
          />
        </Colom2>
      </Wrapper>
    )
  );
}

Product.propTypes = {
  product: string.isRequired,
};
