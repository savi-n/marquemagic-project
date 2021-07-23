import { useState, useEffect, useContext } from "react";
import styled from "styled-components";

import useFetch from "../../hooks/useFetch";
import SearchSelect from "../SearchSelect";
import { BANK_LIST_FETCH, NC_STATUS_CODE } from "../../_config/app.config";
import { UserContext } from "../../reducer/userReducer";
import { BussinesContext } from "../../reducer/bussinessReducer";

const Input = styled.input`
  height: 50px;
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

export default function BankList({ field, onSelectOptionCallback }) {
  const {
    state: { userToken },
  } = useContext(UserContext);

  const {
    state: { companyDetail },
  } = useContext(BussinesContext);

  const { response } = useFetch({
    url: BANK_LIST_FETCH,
    headers: { authorization: `Bearer ${userToken || companyDetail?.token}` },
  });

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (response) {
      setOptions(
        response.map((bank) => ({
          value: bank.id.toString(),
          name: bank.bankname,
        }))
      );
    }
  }, [response]);

  return (
    <SearchSelect
      name={field.name}
      placeholder={field.placeholder || ""}
      options={options}
      onSelectOptionCallback={onSelectOptionCallback}
    />
  );
}
