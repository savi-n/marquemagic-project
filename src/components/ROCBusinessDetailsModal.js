import { useContext } from "react";
import styled from "styled-components";

import Modal from "./Modal";
import Button from "./Button";
import { BussinesContext } from "../reducer/bussinessReducer";

const Div = styled.div`
  padding: 20px;
`;

const Row = styled.div`
  display: flex;
  margin: 10px 0;
  background: #efefef;
  padding: 20px 10px;
  border-radius: 10px;
`;

const Header = styled.div`
  display: flex;
  margin: 10px 0;
  font-size: 18px;
  font-weight: 900;
  padding: 20px 10px;
  border-radius: 10px;
`;

const Colm1 = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  padding-left: 20px;
`;

const Colm2 = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
`;

export default function ROCBusinessDetailsModal({ onClose }) {
  const {
    state: { companyDetail },
  } = useContext(BussinesContext);
  return (
    <Modal show={true} onClose={onClose} width="50%">
      <Div>
        <Row>
          <Colm1>Business Name</Colm1>
          <Colm2>{companyDetail.BusinessName}</Colm2>
        </Row>

        <Row>
          <Colm1>Email</Colm1>
          <Colm2>{companyDetail.Email}</Colm2>
        </Row>
        <Row>
          <Colm1>Address</Colm1>
          <Colm2>{companyDetail.Address}</Colm2>
        </Row>

        <Row>
          <Colm1>Pancard Number</Colm1>
          <Colm2>{companyDetail.PancardNumber}</Colm2>
        </Row>

        <Row>
          <Colm1>CIN</Colm1>
          <Colm2>{companyDetail.CIN}</Colm2>
        </Row>

        <Row>
          <Colm1>Email</Colm1>
          <Colm2>{companyDetail.Email}</Colm2>
        </Row>
        <Row>
          <Colm1>Registration Number</Colm1>
          <Colm2>{companyDetail.RegistrationNumber}</Colm2>
        </Row>
        <Row>
          <Colm1>Company Category</Colm1>
          <Colm2>{companyDetail.CompanyCategory}</Colm2>
        </Row>

        {companyDetail.directorsForShow.length && (
          <>
            <Header>Directors/Partners</Header>
            <Row>
              <Colm1>Name</Colm1>
              <Colm2>Din</Colm2>
            </Row>
            {companyDetail.directorsForShow.map((dir, index) => (
              <Row key={index}>
                <Colm1>{dir.Name}</Colm1>
                <Colm2>{dir.Din}</Colm2>
              </Row>
            ))}
          </>
        )}
      </Div>
      <Button name="Close" onClick={onClose} />
    </Modal>
  );
}
