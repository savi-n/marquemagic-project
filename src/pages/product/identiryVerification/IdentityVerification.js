import { useState, useContext } from "react";
import styled from "styled-components";
import Button from "../../../components/Button";
import OtpModal from "../../../components/otpModal";
import ModalRenders from "../../../components/ModalRenders";
import { GENERATE_OTP_URL, NC_STATUS_CODE } from "../../../_config/app.config";
import { StoreContext } from "../../../utils/StoreProvider";
import useForm from "../../../hooks/useForm";
import useFetch from "../../../hooks/useFetch";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
  background: ${({ theme }) => theme.themeColor1};
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

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const FieldWrapper = styled.div`
  padding: 20px 0;
  width: 50%;
`;

const H2 = styled.h2`
  width: 50%;
  text-align: center;
  font-weight: 500;
`;

const link = "https://media-public.canva.com/uClYs/MAED4-uClYs/1/s.svg";

export default function IdentityVerification({ productDetails, nextFlow }) {
  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  const { newRequest } = useFetch();

  const { register, handleSubmit, formState } = useForm();

  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [bankStatus, setBankStatus] = useState("");

  const [toggleModal, setToggleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedAccount, setSelectedAccount] = useState(null);

  const onSubmit = async ({ customerId, mobileNo }) => {
    setBankStatus(null);
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

      if (response.statusCode === NC_STATUS_CODE.serverError) {
        setErrorMessage(response.message);
      }

      if (response.statusCode === NC_STATUS_CODE.success) {
        setToggleModal(true);
        setBankStatus(response.statusCode);
        setUserId(response.userId);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid Data Given");
    }
  };

  const onClose = () => {
    setToggleModal(false);
  };

  return (
    productDetails && (
      <>
        <Colom1>
          <H>
            Help us with your <span>Identity Verification</span>
          </H>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              {register({
                name: "mobileNo",
                placeholder: "Enter Mobile Number",
                mask: {
                  NumberOnly: true,
                  CharacterLimit: 10,
                },
              })}
            </FieldWrapper>
            <H2>or</H2>
            <FieldWrapper>
              {register({
                name: "customerId",
                placeholder: "Enter Customer ID",
              })}
            </FieldWrapper>
            <Button
              type="submit"
              name="Login"
              fill="blue"
              disabled={
                !(formState.values?.customerId || formState.values?.mobileNo) ||
                (formState.values?.customerId && formState.values?.mobileNo)
              }
            />
          </form>
        </Colom1>
        <Colom2>
          <Img src={productDetails.imageUrl} alt="Loan Caption" />
        </Colom2>
        {toggleModal && (
          <OtpModal
            setBankStatus={setBankStatus}
            setStatus={setStatus}
            setUserId={setUserId}
            toggle={onClose}
            show={toggleModal}
            mobileNo={formState.values?.mobileNo}
            customerId={formState.values?.customerId}
            userId={userId}
            status={status}
            setSelectedAccount={setSelectedAccount}
            selectedAccount={selectedAccount}
            nextFlow={nextFlow}
          />
        )}
        {(!bankStatus || bankStatus === "NC500") && (
          <ModalRenders
            show={toggleModal}
            toggle={onClose}
            link={link}
            message={errorMessage}
          />
        )}
      </>
    )
  );
}
