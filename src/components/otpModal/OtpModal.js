import { useState, useEffect } from "react";
import styled from "styled-components";

import { VERIFY_OTP_URL, NC_STATUS_CODE } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import Loading from "../../components/Loading";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

import "./style.scss";

var arr;

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

const LinkButton = styled.div`
  background: transparent;
  border: none;
  color: #f37087;
  padding: 15px;
  font-weight: 500;
  cursor: pointer;
  ${({ disabled }) =>
    disabled &&
    `
      color:grey;
      cursor:not-allowed
    `}
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
  background-size: cover;
`;

function OTPInput(d) {
  const inputs = document.querySelectorAll("#otp > *[id]");

  if (d) {
    inputs.forEach((el) => {
      el.value = "";
    });
    return;
  }

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("keydown", function(event) {
      if (event.key === "Backspace") {
        event.preventDefault();
        inputs[i].value = "";
        if (i !== 0) inputs[i - 1].focus();
      } else {
        if (i === inputs.length - 1 && inputs[i].value !== "") {
          return true;
        } else if (event.keyCode > 47 && event.keyCode < 58) {
          inputs[i].value = event.key;
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        } else if (event.keyCode > 64 && event.keyCode < 91) {
          inputs[i].value = String.fromCharCode(event.keyCode);
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        }
      }
    });
  }
  arr = inputs;
}

const otpResendTime = 120;

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
    userId: { mobileNo, customerId, userId, otp },
    setUserDetails,
    errorMessage,
  } = props;

  OTPInput();

  const { newRequest } = useFetch();
  const { register, formState } = useForm();
  const [accounts, setAccounts] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);

  const [seconds, setSeconds] = useState(otpResendTime);
  const [otpT, setOtp] = useState("");

  const submitOtp = async (formData = {}) => {
    let inputOtp = "";
    arr.forEach((el) => {
      inputOtp += el.value;
    });
    setOtp(inputOtp);

    let otpValue = inputOtp || otpT;

    if (!otpValue) {
      // return
      otpValue = otp; // development only
    }

    const bodyData = {
      otp: otpValue,
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
    }

    if (response.statusCode === NC_STATUS_CODE.NC200) {
      setUserDetails({
        userDetails: response.userDetails,
        userBankDetails: response.cubDetails,
        userToken: response.token,
      });

      onProceed();
    } else if (
      response.statusCode === NC_STATUS_CODE.NC302 &&
      response.message.includes("Invalid")
    ) {
      setMessage(response.message);
    } else if (
      response.statusCode === NC_STATUS_CODE.NC302 &&
      response.message.includes("Multiple")
    ) {
      setAccounts(response.accountDetails);
    }
    setLoading(false);
  };

  useEffect(() => {
    let timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    if (!seconds) {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [seconds]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (seconds) {
      return;
    }

    resend({ mobileNo, customerId });
    setSeconds(otpResendTime);
    OTPInput(true);
  };

  const handleProceed = async () => {
    const selectedAccount = formState?.values?.account;
    if (!selectedAccount) {
      return;
    }

    await submitOtp({
      customerId: selectedAccount,
    });
  };

  return (
    <Modal onClose={toggle} show={show} width="50%">
      <ModalWrapper>
        {message && error && <div>{message}</div>}
        {loading ? (
          <Loading />
        ) : accountAvailable ? (
          !accounts ? (
            <>
              <OTPHead>OTP Verification</OTPHead>
              <hr />
              <OTPCaption>
                A 6 digit OTP has been sent to your mobile number{" "}
                {"*".repeat(mobileNo.length - 4)}
                {mobileNo.substring(mobileNo.length - 4)}
                Kindly enter it below. &nbsp;
                <b className="cursor-pointer" onClick={toggle}>
                  Wrong number?
                </b>
              </OTPCaption>
              <div className="mb-6 text-center">
                <div id="otp" className="flex justify-center">
                  {["first", "second", "third", "fourth", "fifth", "sixth"].map(
                    (el) => (
                      <input
                        className="m-2 text-center form-control form-control-solid rounded focus:border-blue-400 focus:shadow-outline"
                        type="text"
                        id={`${el}`}
                        maxLength="1"
                        onFocus={() => {
                          setMessage(null);
                        }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className={`${seconds > 0 ? "flex" : "hidden"} opacity-50`}>
                Request a new OTP after: {seconds}
              </div>
              <LinkButton onClick={handleResend} disabled={!!seconds}>
                Resend OTP
              </LinkButton>
              <Button
                fill="blue"
                onClick={() => submitOtp()}
                name="Confirm OTP"
              />
            </>
          ) : (
            accounts && (
              <section className="flex flex-col items-center gap-y-6">
                <OTPCaption>
                  Multiple accounts found. <br /> Please select the account you
                  want to continue your application with
                </OTPCaption>
                <Field>
                  {register({
                    name: "account",
                    placeholder: "Select account",
                    type: "select",
                    options: accounts.map((a) => ({
                      value: a.accNum,
                      name: `${"*".repeat(
                        a.accNum.length - 4
                      )}${a.accNum.substring(a.accNum.length - 4)}`,
                    })),
                    value: formState?.values?.account,
                  })}
                </Field>

                <Button
                  disabled={!formState?.values?.account}
                  onClick={handleProceed}
                  fill="blue"
                  name="Proceed"
                />
              </section>
            )
          )
        ) : (
          <MessageBox>
            <ImgBox />
            <SorrySpan>Sorry!</SorrySpan>
            <Message>{errorMessage || message}</Message>
          </MessageBox>
        )}
      </ModalWrapper>
    </Modal>
  );
}
