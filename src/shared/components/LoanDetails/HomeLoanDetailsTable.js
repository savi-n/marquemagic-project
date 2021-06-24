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

const tableContent = {
  heads: [
    "Particulars(Period)",
    "Upto 30 Lakhs",
    "Above 30 Lakhs and Upto 75 Lakhs",
    "Above 75 Lakhs",
  ],
  content: [
    ["Upto 5 years", "10.25%", "10.75%", "11.25%"],
    ["Above 5 years and Upto 10 years", "10.25%", "10.75%", "11.25%"],
    ["Above 10 years and Upto 15 years", "10.25%", "10.75%", "11.25%"],
  ],
};

export default function HomeLoanDetailsTable() {
  return (
    <TableWrapper>
      <Row>
        {tableContent.heads.map((head) => (
          <Head key={head}>{head}</Head>
        ))}
      </Row>

      {tableContent.content.map((row, i) => (
        <Row key={i}>
          {row.map((colom) => (
            <Colom key={colom}>{colom}</Colom>
          ))}
        </Row>
      ))}
    </TableWrapper>
  );
}
