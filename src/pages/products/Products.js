import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import Card from '../../components/Card';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import { PRODUCT_LIST_URL } from '../../_config/app.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';
import Button from 'components/Button';
import imgDotElement from 'assets/images/bg/Landing_page_dot-element.png';

const Wrapper = styled.div`
	padding: 30px 80px 50px 80px;
`;

const Head = styled.h3`
	text-align: center;
	font-size: 1.5em;
	margin-bottom: 30px;
	font-weight: 600;
	color: #4e4e4e;
`;

const ProductsBox = styled.div`
	display: flex;
	justify-content: center;
	/* gap: 50px; */
	/* gap: 20px; */
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

const DivAdd = styled.div`
	padding: 20px 0 20px 0;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	/* gap: 50px; */
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
const AddProductBox = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 40px;
	button {
		padding: 6px 0px;
		svg {
			font-weight: 500;
		}
		span {
			font-size: 16px;
		}
	}
`;

const ImgDotElementRight = styled.img`
	position: fixed;
	right: 0;
	height: 40px;
	width: 100px;
	margin-right: 50px;
`;
const ImgDotElementLeft = styled.img`
	position: fixed;
	left: 0;
	margin-top: 300px;
	height: 40px;
	width: 100px;
	margin-left: 50px;
`;

export default function Products() {
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const { response: products } = useFetch({
		url: PRODUCT_LIST_URL({ whiteLabelId }),
	});

	const [addedProduct, setAddedProduct] = useState(null);

	useEffect(() => {
		const url = window.location.hostname;
		localStorage.removeItem('formstate');
		localStorage.removeItem('formstatepan');
		localStorage.removeItem('aadhar');
		localStorage.removeItem('encryptWhiteLabel');
		localStorage.removeItem('userToken');
		localStorage.removeItem(url);
		const wt_lbl = localStorage.getItem('wt_lbl');
		localStorage.clear();
		localStorage.setItem('wt_lbl', wt_lbl);
	}, []);

	useEffect(() => {}, [addedProduct]);

	const [addProduct, setAddProduct] = useState(false);

	return (
		<Wrapper>
			{' '}
			<Head>Choose a Loan Product</Head>
			<ImgDotElementRight src={imgDotElement} alt='dot' />
			<ImgDotElementLeft src={imgDotElement} alt='dot' />
			<ProductsBox>
				{products &&
					products.data.map(
						(product, idx) =>
							idx < 3 && (
								<Card product={product} key={`product__${product.id}`} />
							)
					)}
			</ProductsBox>
			<ProductsBox style={{ marginTop: 40 }}>
				{!addedProduct && products?.data?.length > 3 ? (
					<AddProductBox>
						<Button onClick={() => setAddProduct(true)} roundCorner>
							<FontAwesomeIcon size='sm' icon={faPlus} />
							&nbsp;&nbsp;
							<span className='text-blue'>Add Product</span>
						</Button>
					</AddProductBox>
				) : (
					<>
						{addedProduct && (
							<Card product={addedProduct} key={`product__${addProduct.id}`} />
						)}
					</>
				)}
			</ProductsBox>
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
