import { useState, useContext } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import Button from "../../../components/Button";
import GuageMeter from "../../../components/GuageMeter";
import { FlowContext } from "../../../reducer/flowReducer";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Colom2 = styled.div`
  width: 30%;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const Caption = styled.h2`
  text-align: center;
  font-size: 1em;
  font-weight: 500;
  margin: 20px 0;
`;

const BtnWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CaptionImg = styled.div`
  background: ${({ bg }) => (bg ? `url(${bg})` : "transparent")};
  height: 150px;
  width: 70%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const data = [
  {
    caption: `Your application has been forwarded to the branch, desicion shall be communicated within 2-3 working days.`,
    guarantor: true,
  },
  {
    caption: `Congratulations you are eligible for a loan of Rs... and the same is in-princippaly approved. Final Saction will be communicated with in one or two working days`,
    guarantor: true,
  },
  {
    caption: `Sorry! You are not eligible for the requested loan as your Credit score is not satisfactory`,
    guarantor: false,
  },
];

ApplicationSubmitted.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
};

export default function ApplicationSubmitted({
  productDetails,
  id,
  map,
  onFlowChange,
}) {
  const {
    actions: { activateSubFlow },
  } = useContext(FlowContext);

  const [count, setData] = useState(0);

  const subFlowActivate = () => {
    activateSubFlow(id);
    onFlowChange(map.sub);
  };

  // const {
  //   state: { userToken },
  // } = useContext(UserContext);

  const d = data[count];
  return (
    <>
      <Colom1>
        {!d.guarantor ? (
          <GuageMeter />
        ) : (
          <CaptionImg bg={productDetails.imageUrl} />
        )}
        <Caption>{d.caption}</Caption>

        {d.guarantor && (
          <>
            <Caption>Any Guarantor?</Caption>
            <BtnWrap>
              <Button name="Yes" onClick={subFlowActivate} />
              <Button name="No" onClick={() => setData(count + 1)} />
            </BtnWrap>
          </>
        )}
      </Colom1>
      <Colom2>
        <Img src={productDetails.imageUrl} alt="Loan Caption" />
      </Colom2>
    </>
  );
}
