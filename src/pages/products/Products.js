import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import Card from '../../components/Card';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import { PRODUCT_LIST_URL } from '../../_config/app.config';

const Wrapper = styled.div`
	padding: 50px 80px;
`;

const Head = styled.h3`
	text-align: center;
	font-size: 1.5em;
	font-weight: 500;
`;

const Div = styled.div`
	padding: 20px 0;
	display: flex;
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

export default function Products() {
	const {
		state: { whiteLabelId }
	} = useContext(AppContext);

	const { response: products } = useFetch({
		url: PRODUCT_LIST_URL({ whiteLabelId })
	});

	useEffect(() => {
		localStorage.removeItem('formstate');
		localStorage.removeItem('formstatepan');
		localStorage.removeItem('aadhar');
	}, []);

	return (
		<Wrapper>
			<Head>Select a Loan Product</Head>
			<Div>
				{products && products.data.map(product => <Card product={product} key={`product__${product.id}`} />)}
			</Div>
		</Wrapper>
	);
}
