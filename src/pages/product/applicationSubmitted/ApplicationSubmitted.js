import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import Button from "../../../components/Button";
import GuageMeter from "../../../components/GuageMeter";
import { FlowContext } from "../../../reducer/flowReducer";

import SearchSelect from "../../../components/SearchSelect";
import { UserContext } from "../../../reducer/userReducer";
import useFetch from "../../../hooks/useFetch";
import { NC_STATUS_CODE, SEARCH_LOAN_ASSET } from "../../../_config/app.config";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
  background: ${({ theme }) => theme.themeColor1};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Colom2 = styled.div`
  width: 30%;
  background: ${({ theme }) => theme.themeColor1};
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

export default function ApplicationSubmitted({ productDetails, id }) {
  const {
    state: { flowMap },
    actions: { activateSubFlow },
  } = useContext(FlowContext);

  const history = useHistory();

  const [count, setData] = useState(0);

  const subFlowActivate = () => {
    activateSubFlow(id);
    history.push(flowMap[id].sub);
  };

  const {
    state: { userToken },
  } = useContext(UserContext);

  const { newRequest } = useFetch();

  const getOptions = async (data) => {
    const opitionalDataReq = await newRequest(
      SEARCH_LOAN_ASSET,
      { method: "POST", data },
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    const opitionalDataRes = opitionalDataReq.data;
    if (opitionalDataRes.message) {
      return opitionalDataRes.data;
    }
    return [];
  };

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
            <SearchSelect
              searchable
              title="Search Branch"
              searchOptionCallback={getOptions}
            />
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
