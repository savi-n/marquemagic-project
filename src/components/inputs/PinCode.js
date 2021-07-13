import { useEffect, useState } from "react";
import styled from "styled-components";

import useFetch from "../../hooks/useFetch";
import { PINCODE_ADRRESS_FETCH } from "../../_config/app.config";
import InputField from "./InputField";

const Input = styled.input`
  height: 50px;
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  position: relative;
`;

const Div = styled.div`
  position: relative;
  /* overflow: hidden; */
`;

const Label = styled.label`
  position: absolute;
  background: rgba(0, 0, 0, 0.3);
  top: -10%;
  bottom: 0%;
  left: 0%;
  right: 0%;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(15px);
`;

export default function Pincode(props) {
  const { newRequest } = useFetch();

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (props.value) {
      onPinChange({
        target: { name: props.name, value: props.value },
      });
    }
  }, [props.value]);

  const onPinChange = async (event) => {
    const { value } = event.target;

    props.onChange(event);

    if (props.noActionTrigger) {
      return;
    }

    if (value.length === props.makeApiCall) {
      setProcessing(true);
      const response = await newRequest(
        PINCODE_ADRRESS_FETCH({ pinCode: value }),
        {}
      );
      const pincodeData = response.data;

      if (pincodeData.status === "nok") {
        return;
      }

      for (const [k, v] of props.valueForFields) {
        const target = { name: k, value: pincodeData[v][0] };
        props.onChange({ target });
      }
    }
    setProcessing(false);
  };

  return (
    <Div>
      <InputField
        type={"text"}
        {...props}
        onChange={onPinChange}
        processing={processing}
      />
      {processing && <Label>Fetching...</Label>}
    </Div>
  );
}
