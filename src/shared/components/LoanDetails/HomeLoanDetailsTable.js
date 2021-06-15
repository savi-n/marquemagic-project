import styled from "styled-components";

const TableWrapper = styled.div`
  width: 100%;
  padding: 10px;
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  border-radius: 5px;
  margin-bottom: 20px;
`;

const Row = styled.div`
  display: flex;
  border-radius: 10px;
  overflow: hidden;
`;

const Colom = styled.div`
  padding: 15px 40px;
  flex-basis: calc(60% / 3);
  border-right: 1px solid #ececec;
  font-size: 15px;
  &:first-child {
    flex-basis: 40%;
  }
  &:last-child {
    border-right: none;
  }
`;

const Head = styled(Colom)`
  background: #f7f7f7;
  font-weight: 700;
`;

export default function HomeLoanDetailsTable() {
  return (
    <TableWrapper>
      <Row>
        <Head>Particulars(Period)</Head>
        <Head>Upto 30 Lakhs</Head>
        <Head>Above 30 Lakhs and Upto 75 Lakhs</Head>
        <Head>Above 75 Lakhs</Head>
      </Row>

      <Row>
        <Colom>Upto 5 years</Colom>
        <Colom>10.25%</Colom>
        <Colom>10.75%</Colom>
        <Colom>11.25%</Colom>
      </Row>
      <Row>
        <Colom>Above 5 years and Upto 10 years</Colom>
        <Colom>10.25%</Colom>
        <Colom>10.75%</Colom>
        <Colom>11.25%</Colom>
      </Row>

      <Row>
        <Colom>Above 10 years and Upto 15 years</Colom>
        <Colom>10.25%</Colom>
        <Colom>10.75%</Colom>
        <Colom>11.25%</Colom>
      </Row>
    </TableWrapper>
  );
}
