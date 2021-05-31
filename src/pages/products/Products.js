import { useContext } from "react";
import styled from "styled-components";

import Card from "../../components/Card";
import useFetch from "../../hooks/useFetch";
import { StoreContext } from "../../utils/StoreProvider";
import { PRODUCT_LIST_URL } from "../../_config/app.config";

const Wrapper = styled.div`
  padding: 50px 80px;
`;

const Head = styled.h3`
  text-align: center;
  color: grey;
`;

const Div = styled.div`
  padding: 20px 0;
  display: flex;
  align-items: center;
  gap: calc(12% / 3);
`;

export default function Products() {
  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  const { response: products } = useFetch({
    url: PRODUCT_LIST_URL({ whiteLabelId }),
  });

  return (
    <Wrapper>
      <Head>Select a Loan Product</Head>
      <Div>
        {products &&
          products.data.map((product) => (
            <Card product={product} key={`product__${product.id}`} />
          ))}
      </Div>
    </Wrapper>
  );
}
