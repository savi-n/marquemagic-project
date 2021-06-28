import { useState, useEffect } from "react";
import styled from "styled-components";

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

const Caption = styled.div`
  color: rgba(0, 0, 0, 0.5);
`;

const otpResendTime = 120;

export default function OtpTimer({
  handleResend,
  loading,
  accountAvailable,
  accounts,
}) {
  const [seconds, setSeconds] = useState(otpResendTime);

  useEffect(() => {
    let timer;
    if (!loading && accountAvailable && !accounts) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      if (!seconds) {
        clearTimeout(timer);
      }
    }
    return () => {
      clearTimeout(timer);
    };
  }, [seconds, loading, accountAvailable, accounts]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (seconds) return;
    handleResend();
  };

  return (
    <>
      {seconds ? (
        <Caption>Request a new OTP after: {seconds} seconds</Caption>
      ) : null}
      <LinkButton onClick={handleClick} disabled={!!seconds}>
        Resend OTP
      </LinkButton>
    </>
  );
}
