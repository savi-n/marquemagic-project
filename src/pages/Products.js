<<<<<<< HEAD
import { useContext } from "react";
import styled from "styled-components";

import Card from "../components/Card";
import useFetch from "../hooks/useFetch";
import { StoreContext } from "../utils/StoreProvider";
import { PRODUCT_LIST_URL, API_END_POINT } from "../config";

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

=======
import { useContext } from 'react';
import Card from '../components/Card';
import useFetch from '../hooks/useFetch';
import { StoreContext } from '../utils/StoreProvider';
import { PRODUCT_LIST_URL } from '../config';

>>>>>>> 4674140a2876e39e65ef75252c4923d346a8c161
export default function Products() {
  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

<<<<<<< HEAD
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
=======
	return (
		<section className='px-32 py-16'>
			<h3 className='text-center text-gray-700'>Select a Loan Product</h3>
			<div className='py-10 px-0 flex items-center grid-cols-4 gap-24'>
				{products && products.data.map(product => <Card product={product} key={`product__${product.id}`} />)}
			</div>
		</section>
	);
>>>>>>> 4674140a2876e39e65ef75252c4923d346a8c161
}
