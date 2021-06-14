import { useState, useEffect, useContext, useRef } from "react";
import styled from "styled-components";

import Loading from "../components/Loading";
import {
  CUB_ACCOUNT_MINI_STATEMENT,
  NC_STATUS_CODE,
  GENERATE_OTP_URL,
  USER_ROLES,
  BANK_TOKEN_API,
} from "../_config/app.config";
import { AppContext } from "../reducer/appReducer";
import { UserContext } from "../reducer/userReducer";
import useFetch from "../hooks/useFetch";
import useForm from "../hooks/useForm";
import Modal from "./Modal";
import Button from "./Button";
import OtpModal from "../components/OtpModal/OtpModal";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const FieldWrapper = styled.div`
  padding: 20px 0;
`;

const H2 = styled.h2`
  text-align: center;
  font-weight: 500;
`;

const BankLogo = styled.img`
  width: 30px;
  height: 30px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`;

export default function GetCUBStatementModal({
  onClose,
  userType,
  setOtherUserTypeDetails,
}) {
  const [loading, setLoading] = useState(true);
  const [toggleModal, setToggleModal] = useState(false);
  const [toggleOtpModal, setToggleOtpModal] = useState(false);
  const bankTokenRef = useRef();
  const [userId, setUserId] = useState("");

  const [accountAvailable, setAccountAvailable] = useState(false);

  const [error, setError] = useState(null);

  const { register, handleSubmit, formState } = useForm();

  const { newRequest } = useFetch();

  const {
    state: { whiteLabelId, clientToken },
  } = useContext(AppContext);

  const {
    state: { userAccountToken },
  } = useContext(UserContext);

  useEffect(() => {
    async function getBankToken() {
      try {
        const bankTokenReq = await newRequest(
          BANK_TOKEN_API,
          {
            method: "POST",
            data: {
              type: "BANK",
              linkRequired: false,
              isEncryption: false,
            },
          },
          {
            authorization: clientToken,
          }
        );

        const bankTokenRes = bankTokenReq?.data;

        if (bankTokenRes.statusCode === NC_STATUS_CODE.NC200) {
          bankTokenRef.current = {
            bankToken: bankTokenRes.generated_key,
            requestId: bankTokenRes.request_id,
          };
          if (!userType) {
            await fetchData(userAccountToken);
            setOtherUserTypeDetails(bankTokenRef.current);
            onClose(true);
          } else {
            setToggleModal(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getBankToken();
    return () => {};
  }, []);

  async function fetchData(token) {
    try {
      const req = await newRequest(
        CUB_ACCOUNT_MINI_STATEMENT,
        { method: "POST", data: { accToken: token } },
        { authorization: bankTokenRef.current.bankToken }
      );

      const res = req.data;
      if (res.statusCode === NC_STATUS_CODE.NC200) {
        console.log("Success Message");
      } else {
        setError(res.message);
      }
    } catch (error) {
      console.error("Something Went Wrong Try Again Later");
    }
  }

  const onSubmit = async ({ customerId, mobileNo }) => {
    setToggleModal(false);
    setLoading(true);

    if (!customerId && !mobileNo) {
      return;
    }

    if (customerId && mobileNo) {
      return;
    }

    try {
      const otpReq = await newRequest(GENERATE_OTP_URL, {
        method: "POST",
        data: {
          mobileNo,
          customerId,
          white_label_id: whiteLabelId,
        },
      });

      const response = otpReq.data;

      if (response.statusCode === NC_STATUS_CODE.NC500) {
        setError(response.message);
        setAccountAvailable(false);
      }

      if (response.statusCode === NC_STATUS_CODE.NC200) {
        setAccountAvailable(true);
        setUserId(response);
        setToggleOtpModal(true);
      }
    } catch (error) {
      console.error(error);
      setError("Invalid Data Given");
    }

    setLoading(false);
  };

  const onProceed = async (userTypeDetails) => {
    setLoading(true);
    setToggleOtpModal(false);
    setToggleModal(false);
    await fetchData(userTypeDetails.userAccountToken);
    setOtherUserTypeDetails({ ...userTypeDetails, ...bankTokenRef.current });
    setLoading(false);
    onClose(true);
  };

  return (
    <>
      <Modal show={!toggleModal} onClose={onClose} width="50%">
        <Loading />
      </Modal>
      <Modal show={toggleModal} onClose={onClose} width="50%">
        {loading ? (
          <Loading />
        ) : (
          <Wrapper>
            <BankLogo
              src={"https://picsum.photos/200/300"}
              alt={"cub_bank_logo"}
              loading="lazy"
            />
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldWrapper>
                {register({
                  name: "mobileNo",
                  placeholder: "Enter Mobile Number",
                  mask: {
                    NumberOnly: true,
                    CharacterLimit: 10,
                  },
                  value: formState?.values?.mobileNo,
                })}
              </FieldWrapper>
              <H2>or</H2>
              <FieldWrapper>
                {register({
                  name: "customerId",
                  placeholder: "Use Customer ID to Login",
                  value: formState?.values?.customerId,
                })}
              </FieldWrapper>
              <Button
                type="submit"
                name="Login"
                fill
                disabled={
                  !(
                    formState.values?.customerId || formState.values?.mobileNo
                  ) ||
                  (formState.values?.customerId && formState.values?.mobileNo)
                }
              />
            </form>
          </Wrapper>
        )}
      </Modal>
      {toggleOtpModal && (
        <OtpModal
          loading={loading}
          setLoading={setLoading}
          accountAvailable={accountAvailable}
          setAccountAvailable={setAccountAvailable}
          resend={onSubmit}
          toggle={onClose}
          onProceed={onProceed}
          show={toggleOtpModal}
          userId={userId}
          errorMessage={error}
        />
      )}
    </>
  );
}
