import { useState, useContext, useCallback, useMemo } from "react";
import styled from "styled-components";

import Modal from "./Modal";
import Button from "./Button";
import { BANK_LIST_API, NC_STATUS_CODE } from "../_config/app.config";
import BANK_FLOW from "../_config/bankflow.config";
import { AppContext } from "../reducer/appReducer";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";
import Loading from "../components/Loading";

const Bank = styled.div`
  padding: 10px;
  border: 1px solid black;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 40%;
  margin: 10px 0;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

const BankWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10%;
  padding: 30px;
`;

const BankDetails = styled(BankWrapper)`
  flex-basis: 100%;
  justify-content: center;
`;

const BankName = styled.div`
  flex: 1;
  padding: 0 10px;
`;

const TitleWrapper = styled.div`
  flex-basis: 100%;
`;

const Title = styled.h4`
  font-size: 1.2em;
  font-weight: 500;
  /* width: 90%; */
  text-align: center;
  /* margin-bottom: 20px; */
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  padding-bottom: 10px;
`;

const ContentWrapper = styled.div`
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
`;

const BankLogo = styled.img`
  width: 30px;
  height: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  padding: 20px 50px;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const Captcha = styled.img`
  height: 50px;
  width: 100px;
  object-fit: fill;
  display: block;
  margin: 10px auto;
`;

export default function BankStatementModal({ showModal, onClose }) {
  const {
    state: { clientToken },
  } = useContext(AppContext);

  const { response, loading, newRequest } = useFetch({
    url: BANK_LIST_API,
    headers: { authorization: `${clientToken}` },
  });

  const [processing, setProcessing] = useState(false);

  const [bankChoosen, setBankChoosen] = useState({});
  const [flowStep, setFlowStep] = useState(0);
  const [captchaUrl, setCaptchaUrl] = useState(null);
  const [accountsList, setAccountsList] = useState([]);

  const postData = async (api, data, method = "POST") => {
    return newRequest(api, { method, data }, { authorization: clientToken });
  };

  const flowCompleted = () => {
    onClose();
  };

  const onBankSelect = (bank) => {
    setBankChoosen(bank);
  };

  const handleNext = () => {
    // const accountTypes = bankChoosen.bank_type || [];

    // if (accountTypes.length > 1) {
    // }

    BANK_FLOW[bankChoosen.name.toLowerCase()]?.length
      ? setFlowStep(flowStep + 1)
      : flowCompleted();
  };

  const getCaptcha = async (url) => {
    const response = await postData(url, {}, "GET");
    const data = response.data;
    if (data?.imagePath) setCaptchaUrl(data?.imagePath);
  };
  const handleSubmitForm = async (formData) => {
    setProcessing(true);

    try {
      const post = await postData(
        BANK_FLOW[bankChoosen.name.toLowerCase()]?.[flowStep - 1]?.api,
        formData
      );

      const reponse = post.data;
      if (reponse.statusCode === NC_STATUS_CODE.NC500) {
        if (reponse.imagePath) {
          setCaptchaUrl(reponse.imagePath);
        }
        if (response.noOfAccounts > 1) {
          setAccountsList(response.noOfAccounts.accounts);
        }

        BANK_FLOW[bankChoosen.name.toLowerCase()]?.length > flowStep
          ? setFlowStep(flowStep + 1)
          : flowCompleted();
      }
    } catch (error) {
      console.log(error);
    }
    setProcessing(false);
  };

  const { register, handleSubmit, formState } = useForm();
  const { banks = [] } = response || {};

  const buildTemplate = (flow) => {
    if (flow.type === "captcha") {
      if (!captchaUrl && flow?.captchaGet) {
        getCaptcha(flow?.captchaGet);
      }
      return (
        <div key={flow.name}>
          <Captcha
            src={captchaUrl || "https://picsum.photos/200/300"}
            alt="Captcha"
            loading="lazy"
          />
          {register({ ...flow, value: formState?.values[flow.name] })}
        </div>
      );
    }
    return (
      <div key={flow.name}>
        {register({ ...flow, value: formState?.values[flow.name] })}
      </div>
    );
  };

  return (
    <Modal show={showModal} onClose={onClose} width="50%">
      {!loading ? (
        <ContentWrapper>
          {flowStep === 0 && (
            <>
              <TitleWrapper>
                <Title>Select Bank</Title>
              </TitleWrapper>
              <BankWrapper>
                {banks?.map((bank) => (
                  <Bank key={bank.id} onClick={() => onBankSelect(bank)}>
                    <BankLogo src={bank.logo} alt={bank.name} loading="lazy" />
                    <BankName>{bank.name}</BankName>
                    <input
                      type="radio"
                      readOnly
                      checked={bankChoosen.name === bank.name}
                    />
                  </Bank>
                ))}
              </BankWrapper>
              <Button
                name="Next"
                fill
                style={{
                  width: "200px",
                  background: "blue",
                }}
                disabled={!bankChoosen.name}
                onClick={handleNext}
              />
            </>
          )}

          {flowStep > 0 && (
            <BankDetails>
              <BankLogo
                src={bankChoosen.logo}
                alt={bankChoosen.name}
                loading="lazy"
              />
              <Form onSubmit={handleSubmit(handleSubmitForm)}>
                {BANK_FLOW[bankChoosen.name.toLowerCase()]?.[
                  flowStep - 1
                ]?.fields.map((flow) => buildTemplate(flow))}
                <Button
                  type="submit"
                  name="Next"
                  fill
                  disabled={!!Object.keys(formState.error).length || processing}
                  style={{
                    width: "200px",
                    background: "blue",
                  }}
                />
              </Form>
            </BankDetails>
          )}
        </ContentWrapper>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
