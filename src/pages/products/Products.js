import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import Card from '../../components/Card';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import { PRODUCT_LIST_URL } from '../../_config/app.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';

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
	gap: 50px;
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

const DivAdd = styled.div`
	padding: 20px 0 20px 0;
	display: flex;
	flex-wrap: wrap
	gap: 50px;
	justify-content: center;
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

const Add = styled.div`
	color: ${({ theme }) => theme.main_theme_color};
	border-radius: 50px;
	padding: 20px;
	width: calc(100% / 5);
	font-size: 30px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 10px;
	cursor: pointer;
	font-weight: 100;
`;

export default function Products() {
	const {
		state: { whiteLabelId }
	} = useContext(AppContext);

	const { response: products } = useFetch({
		url: PRODUCT_LIST_URL({ whiteLabelId })
	});

	const [addedProduct, setAddedProduct] = useState(null);

	useEffect(() => {
		localStorage.removeItem('formstate');
		localStorage.removeItem('formstatepan');
		localStorage.removeItem('aadhar');
	}, []);

	useEffect(() => {
		console.log(addedProduct);
	}, [addedProduct]);

	const [addProduct, setAddProduct] = useState(false);

	return (
		<Wrapper>
			<Head>Select a Loan Product</Head>
			<Div>
				{products &&
					products.data.map(
						(product, idx) => idx < 3 && <Card product={product} key={`product__${product.id}`} />
					)}
				{!addedProduct ? (
					<Add onClick={() => setAddProduct(true)}>
						<FontAwesomeIcon icon={faPlus} />
						<span className='text-black text-xl'>Add Product</span>
					</Add>
				) : (
					<>{addedProduct && <Card product={addedProduct} key={`product__${addProduct.id}`} />}</>
				)}
			</Div>
			<Modal show={addProduct} width='80%' onClose={() => setAddProduct(false)}>
				<section className='text-center w-full py-6'>
					<span className='w-full text-xl'>Select a Loan Product</span>
				</section>
				<DivAdd>
					{products &&
						products.data.map(
							(product, idx) =>
								idx > 2 && (
									<Card
										add={true}
										setAddedProduct={setAddedProduct}
										product={product}
										key={`product__${product.id}`}
										setAddProduct={setAddProduct}
									/>
								)
						)}
				</DivAdd>
			</Modal>
		</Wrapper>
	);
}
