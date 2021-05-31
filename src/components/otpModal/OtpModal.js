import { useState, useEffect } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

import { VERIFY_OTP_URL, NC_STATUS_CODE } from "../../_config/app.config";
import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import Loading from "../../components/Loading";
import Button from "../../components/Button";

import Modal from "../../shared/components/Modal";
import Message from "../../shared/components/Message";

import "./style.scss";

var arr;

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

const otpResendTime = 60;

export default function OtpModal(props) {
  const {
    loading,
    accountAvailable,
    resend,
    onProceed,
    toggle,
    show,
    mobileNo,
    customerId,
    userId,
    setUserDetails,
  } = props;

  OTPInput();

  const { newRequest } = useFetch();
  const { register, formState } = useForm();

  const [accounts, setAccounts] = useState(null);

  const [seconds, setSeconds] = useState(otpResendTime);
  const [otp, setOtp] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState(null);

  const submitOtp = async (formData = {}) => {
    let inputOtp = "";
    arr.forEach((el) => {
      inputOtp += el.value;
    });
    setOtp(inputOtp);

    const otpValue = inputOtp || otp;

    if (!otpValue) return;

    const bodyData = {
      otp: otpValue,
      mobileNo,
      customerId,
      userId,
      ...formData,
    };

    const data = await newRequest(VERIFY_OTP_URL, {
      method: "POST",
      data: bodyData,
    });

    const response = data.data;

    if (response.statusCode === NC_STATUS_CODE.success) {
      setUserDetails({
        userDetails: response.userDetails,
        userBankDetails: response.cubDetails,
        userToken: response.token,
      });

      onProceed();
    } else if (
      response.statusCode === NC_STATUS_CODE.accounts &&
      response.message.includes("Invalid")
    ) {
      setMessage(response.message);
    } else if (
      response.statusCode === "NC302" &&
      response.message.includes("Multiple")
    ) {
      setAccounts(response.accountDetails);
    }
  };

  useEffect(() => {
    if (seconds > 0) {
      setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      setSeconds(0);
      setDisabled(false);
    }
  }, [seconds]);

  const handleResend = async (e) => {
    e.preventDefault();
    resend({ mobileNo, customerId });
    setSeconds(otpResendTime);
    OTPInput(true);
  };

  const handleProceed = async () => {
    const selectedAccount = formState?.values?.account;
    if (!selectedAccount) {
      setMessage("Please select an account to proceed");
      return;
    }

    await submitOtp({
      customerId: selectedAccount,
    });

    onProceed();
  };

  return (
    <Modal
      onClose={toggle}
      height="auto"
      title={accounts ? "Select Account" : "OTP Verification"}
      margin="base"
      width="lg"
      show={show}
    >
      {loading ? (
        <Loading />
      ) : accountAvailable ? (
        <>
          <Message message={message} invalid={invalid} />
          {!accounts ? (
            <>
              <p>
                A six digit OTP has been sent to *******
                {mobileNo.slice(mobileNo.length - 3, mobileNo.length)}. <br />{" "}
                Kindly enter it below. &nbsp;
                <b className="cursor-pointer" onClick={toggle}>
                  Wrong number?
                </b>
              </p>
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
                          setInvalid(false);
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
              <Link
                to="#"
                onClick={(e) =>
                  !disabled ? handleResend(e) : e.preventDefault()
                }
                className={`${disabled &&
                  "text-pink-400 cursor-not-allowed"} ${!disabled &&
                  "hover:text-pink-400 cursor-pointer text-pink-600 cursor-pointer"} py-4`}
              >
                Resend OTP
              </Link>
              <Button
                fill="blue"
                onClick={() => submitOtp()}
                name="Confirm OTP"
              />
            </>
          ) : (
            accounts && (
              <section className="flex flex-col items-center gap-y-6">
                <p>
                  Multiple accounts found. <br /> Please select the account you
                  want to continue your application with
                </p>
                {register({
                  name: "account",
                  placeholder: "Select account",
                  type: "select",
                  options: accounts.map((a) => ({
                    value: a.accNum,
                    name: a.accNum,
                  })),
                })}

                <Button
                  disabled={!formState?.values?.account}
                  onClick={handleProceed}
                  fill="blue"
                  name="Proceed"
                />
              </section>
            )
          )}
        </>
      ) : (
        "Account Not available"
      )}
    </Modal>
  );
}
