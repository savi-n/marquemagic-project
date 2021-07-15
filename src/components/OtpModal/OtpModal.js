import { useState, useEffect } from "react";
import styled from "styled-components";

import { VERIFY_OTP_URL, NC_STATUS_CODE } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import Loading from "../../components/Loading";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import OtpInput from "./OtpInput";
import OtpTimer from "./OtpTimer";
import { useToasts } from "../Toast/ToastProvider";
import errorImg from "../../assets/images/v1.png";

const ModalWrapper = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

const OTPHead = styled.h2`
  font-size: 1.2em;
  font-weight: 500;
  width: 90%;
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  padding-bottom: 10px;
`;

const OTPCaption = styled.p`
  text-align: center;
  width: 100%;
`;

const Field = styled.div`
  width: 60%;
`;

const Message = styled.div`
  text-align: center;
`;

const MessageBox = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SorrySpan = styled.span`
  text-align: center;
  color: #f37087;
  font-size: 15px;
  font-weight: 500;
`;

const ImgBox = styled.div`
  height: 170px;
  width: 80%;
  background: ${({ bg }) => `url(${bg})`};
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const OtpWrapper = styled.div`
  margin: 20px 0;
`;

export default function OtpModal(props) {
  const {
    loading,
    setLoading,
    accountAvailable,
    setAccountAvailable,
    resend,
    onProceed,
    toggle,
    show,
    userId: { mobileNo, customerId, userId, otp: otpT, bankId },
    setUserDetails,
    errorMessage,
  } = props;

  const { newRequest } = useFetch();
  const { register, formState } = useForm();
  const { addToast } = useToasts();

  const [accounts, setAccounts] = useState(null);
  const [customers, setCustomers] = useState(null);

  const [message, setMessage] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);

  const submitOtp = async (formData = {}) => {
    const bodyData = {
      otp,
      mobileNo,
      customerId,
      userId,
      ...formData,
    };

    setLoading(true);
    const data = await newRequest(VERIFY_OTP_URL, {
      method: "POST",
      data: bodyData,
    });

    const response = data.data;

    if (
      [
        NC_STATUS_CODE.NC305,
        NC_STATUS_CODE.NC306,
        NC_STATUS_CODE.NC308,
      ].includes(response.statusCode)
    ) {
      setMessage(response.message);
      setAccountAvailable(false);
    } else if (response.statusCode === NC_STATUS_CODE.NC200) {
      const userData = {
        userAccountToken: response.accToken,
        userDetails: response.userDetails,
        userBankDetails: response.cubDetails,
        userToken: response.token,
        bankId: bankId,
        userId,
      };

      if (setUserDetails) setUserDetails(userData);

      onProceed(userData);
    }
    // else if (
    //   response.statusCode === NC_STATUS_CODE.NC302 &&
    //   response.message.includes("Invalid")
    // ) {
    //   setMessage(response.message);
    // }

    // 302 multiple customerid
    // customer name customer id
    // 303 multiple account number
    // accType = ['SB - Saving Account', 'CA - Current Account', 'OLCC - OD Account']
    else if (
      response.statusCode === NC_STATUS_CODE.NC302 &&
      response.message.includes("Multiple")
    ) {
      setCustomers(response.accountDetails);
    } else if (
      response.statusCode === NC_STATUS_CODE.NC303 &&
      response.message.includes("Multiple")
    ) {
      setAccounts(response.accountDetails);
    } else {
      addToast({
        message: response.message,
        type: "error",
      });
    }
    setLoading(false);
  };

  // // development only
  // useEffect(() => {
  //   setOtp(otpT?.toString());
  // }, [otpT]);
  // // end Developement

  const handleResend = () => {
    resend({ mobileNo, customerId });
  };

  const handleProceed = async () => {
    const selectedAccount = formState?.values?.account;
    if (!selectedAccount) {
      return;
    }

    let accountsDetails;
    if (accounts) {
      accountsDetails = accounts.find((acc) => acc.accNum === selectedAccount);
    }

    if (customers) {
      accountsDetails = customers.find(
        (acc) => acc.customerId === selectedAccount
      );
    }

    await submitOtp({
      customerId: selectedAccount,
      aadharNum: accountsDetails?.aadharNum || "",
    });
  };

  const handleOtpChange = (otp) => {
    setOtp(otp);
  };

  const selectPlaceholder = () => {
    if (accounts) {
      return "Select Account";
    }

    if (customers) {
      return "Select Customer Id";
    }
  };

  const selectCustomerOptions = () => {
    if (accounts) {
      return accounts.map((a) => ({
        value: a.accNum,
        name: `${a.accType} - ${"*".repeat(
          a.accNum.length - 4
        )}${a.accNum.substring(a.accNum.length - 4)}`,
      }));
    }

    if (customers) {
      return customers.map((a) => ({
        value: a.customerId,
        name: `${a.customerName} - ${a.customerId}`,
        // `${"*".repeat(a.customerId.length - 4)}${a.customerId.substring(
        //   a.customerId.length - 4
        // )}`,
      }));
    }
  };

  return (
    <Modal onClose={toggle} show={show} width="50%">
      <ModalWrapper>
        {message && error && <div>{message}</div>}
        {loading ? (
          <Loading />
        ) : accountAvailable ? (
          !accounts && !customers ? (
            <>
              <OTPHead>OTP Verification</OTPHead>
              <hr />
              {mobileNo && (
                <OTPCaption>
                  A 6 digit OTP has been sent to your mobile number{" "}
                  {"*".repeat(mobileNo.length - 4)}
                  {mobileNo.substring(mobileNo.length - 4)} Kindly enter it
                  below. &nbsp;
                  <b className="cursor-pointer" onClick={toggle}>
                    Wrong number?
                  </b>
                </OTPCaption>
              )}
              <OtpWrapper>
                <OtpInput
                  numInputs={6}
                  handleChange={handleOtpChange}
                  numberOnly
                />
              </OtpWrapper>
              <OtpTimer
                handleResend={handleResend}
                loading={loading}
                accountAvailable={accountAvailable}
                accounts={accounts}
              />
              <Button
                fill
                onClick={() => submitOtp()}
                name="Confirm OTP"
                disabled={otp?.length !== 6}
              />
            </>
          ) : (
            (accounts || customers) && (
              <section className="flex flex-col items-center gap-y-6">
                <OTPCaption>
                  {customers && (
                    <>
                      Multiple customer id found. <br /> Please select a
                      customer id you want to continue your application with
                    </>
                  )}
                  {accounts && (
                    <>
                      Multiple accounts found. <br /> Please select the account
                      you want to continue your application with
                    </>
                  )}
                </OTPCaption>
                <Field>
                  {register({
                    name: "account",
                    placeholder: selectPlaceholder(),
                    type: "select",
                    options: selectCustomerOptions(),
                    value: formState?.values?.account,
                  })}
                </Field>

                <Button
                  disabled={!formState?.values?.account}
                  onClick={handleProceed}
                  fill
                  name="Proceed"
                />
              </section>
            )
          )
        ) : (
          <MessageBox>
            <ImgBox bg={errorImg} />
            <SorrySpan>Sorry!</SorrySpan>
            <Message>{errorMessage || message}</Message>
          </MessageBox>
        )}
      </ModalWrapper>
    </Modal>
  );
}
