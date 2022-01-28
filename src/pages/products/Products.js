import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import Card from '../../components/Card';
import useFetch from '../../hooks/useFetch';
import { AppContext } from '../../reducer/appReducer';
import { API_END_POINT, PRODUCT_LIST_URL } from '../../_config/app.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';
import Button from 'components/Button';
import imgDotElement from 'assets/images/bg/Landing_page_dot-element.png';
import Loader from 'Branch/components/Loader';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useToasts } from 'components/Toast/ToastProvider';

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
	@media (max-width: 700px){
		flex-direction: column;
	}
`;

const StatusBox = styled.div`
	width: 50%;
	padding: 30px;
	border-radius: 10px;
	margin: 50px auto 50px auto;
	box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px;
	@media (max-width: 700px){
		width: auto;
	}
`;

const SectionLoanStatus = styled.section`
	@media (max-width: 700px) {
		margin: 0;
		padding: 30px;
		width: 100%;
	}
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

const ProductName = styled.div`
	color: #4e4e4e;
	font-weight: bold;
`;

export default function Products() {
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const { response: products } = useFetch({
		url: PRODUCT_LIST_URL({ whiteLabelId }),
	});

	const [addedProduct, setAddedProduct] = useState(null);

	const [searching, setSearching] = useState(false);
	const [refstatus, setRefstatus] = useState('');
	const { addToast } = useToasts();
	const [status, setStatus] = useState(null);

	const getStatusCustomer = async () => {
		try {
			setSearching(true);
			const url = `${API_END_POINT}/getLoanStatus`;
			const res = await axios.post(url, { loanRefId: refstatus.trim() });
			if (res?.data?.statusName) {
				setStatus(res?.data?.statusName || '');
			} else {
				addToast({
					message: 'Invalid Loan ID',
					type: 'error',
				});
			}
			setSearching(false);
		} catch (error) {
			addToast({
				message:
					error?.response?.data?.message || 'Server down, Try after sometimes',
				type: 'error',
			});
			setSearching(false);
			// alert('Server down, Try after sometimes.!');
			console.log('error-getStatusCustomer-', error);
			// console.log('error-getStatusCustomer-response-', error.response);
			// alert(error.response.data.message);
		}
	};

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
			<StatusBox>
				<ProductName>
					Here, you can check your application status by entering the loan
					reference ID.
				</ProductName>
				<section className='flex font-medium my-2' style={{ marginRight: 15 }}>
					<input
						className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none rounded-l-full my-2'
						placeholder='Enter Loan Referance ID'
						onChange={e => setRefstatus(e.target.value)}
					/>
					<FontAwesomeIcon
						className='h-12 rounded-r-full cursor-pointer bg-blue-100 text-indigo-700 text-5xl px-4 p-2 my-2'
						icon={faSearch}
						onClick={() => getStatusCustomer()}
					/>
				</section>
				<section className='flex items-center font-semibold'>
					<span className='px-3 font-semibold'>Application status :</span>{' '}
					{searching ? <Loader /> : status && status}
				</section>
			</StatusBox>
		</Wrapper>
	);
}
