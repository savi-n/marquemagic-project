import { useState, useEffect } from "react";
import styled from "styled-components";

import Modal from "./Modal";
import useForm from "../hooks/useForm";
import Button from "./Button";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const Company = styled.div`
  margin: 10px;
  width: 44%;
  border: 1px solid black;
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  @media (max-width: 700px){
    width:80%;
  }
`;

const FieldWrapper = styled.div`
  width: 80%;
`;

export default function CompanySelectModal({
  companyList,
  show,
  onClose,
  onCompanySelect,
  companyNameSearch,
  companyName,
  formState,
}) {
  const [loading, setLoaidng] = useState(false);

  const { register } = useForm();
  const [company, setCompany] = useState(formState?.values?.companyName);
  return (
    <Modal show={show} onClose={onClose} width="50%">
      <Wrapper>
        {companyList.length ? (
          companyList.map((company) => (
            <Company
              key={company.id}
              onClick={() =>
                onCompanySelect(company.CORPORATE_IDENTIFICATION_NUMBER)
              }
            >
              <div>{company.COMPANY_NAME}</div>
              <div>CIN : {company.CORPORATE_IDENTIFICATION_NUMBER}</div>
            </Company>
          ))
        ) : (
          <section className="w-full flex flex-col items-center">
            <section className="py-10">
              No data found for the given company
            </section>
            <input
              className="p-2 border w-full rounded-lg"
              placeholder="Company Name"
              defaultValue={formState?.values?.companyName}
              onChange={(e) => setCompany(e.target.value)}
            />
            <section className="flex flex-col py-8 items-center w-full">
              <Button
                onClick={() => companyNameSearch(company)}
                isLoader={loading}
                name={loading ? "Please wait..." : "Search"}
                disabled={!company || !formState?.values?.companyName}
                fill
              />
            </section>
          </section>
        )}
      </Wrapper>
    </Modal>
  );
}
