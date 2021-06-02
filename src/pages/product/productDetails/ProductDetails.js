import { useContext } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

import Button from "../../../components/Button";
import { FlowContext } from "../../../reducer/flowReducer";

const Colom1 = styled.section`
  flex: 1;
  background: ${({ theme }) => theme.themeColor1};
  padding: 50px;
`;

const Colom2 = styled.section`
  width: 30%;
  background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Div = styled.div`
  display: flex;
  justify-content: center;
`;

const Li = styled.li`
  margin: 12px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.8);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    background: red;
    font-weight: bold;
    width: 5px;
    height: 5px;
    border-radius: 5px;
    left: -20px;
    top: 8px;
  }

  a {
    color: blue;
  }
`;

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

export default function ProductDetails({ productDetails }) {
  const {
    state: { basePageUrl },
  } = useContext(FlowContext);
  const history = useHistory();
  const startFlow = () => {
    history.push(basePageUrl);
  };
  return (
    productDetails && (
      <>
        <Colom1>
          <H dangerouslySetInnerHTML={{ __html: productDetails.head }} />
          <div>
            <ul>
              {productDetails.li.map((l) => (
                <Li dangerouslySetInnerHTML={{ __html: l }} key={uuidv4()} />
              ))}
            </ul>
          </div>
          {basePageUrl && (
            <Div>
              <Button name="Next" onClick={startFlow} />
            </Div>
          )}
        </Colom1>
        <Colom2>
          <Img src={productDetails.imageUrl} alt="Loan Caption" />
        </Colom2>
      </>
    )
  );
}
