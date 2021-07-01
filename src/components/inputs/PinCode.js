import { useEffect } from "react";
import styled from "styled-components";

import useFetch from "../../hooks/useFetch";
import { PINCODE_ADRRESS_FETCH } from "../../_config/app.config";

const Input = styled.input`
  height: 50px;
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

export default function Pincode(props) {
  const { newRequest } = useFetch();

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

    if (value.length === props.makeApiCall) {
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
  };

  return <Input type={"text"} {...props} onChange={onPinChange} />;
}
