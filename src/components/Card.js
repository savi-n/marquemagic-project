/* Landing page of nc-onboarding journey contains different loan cards.
This card is designed and defined here */
import { useSelector, useDispatch } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import styled from 'styled-components';
import imgSelectProduct from 'assets/images/bg/Landing_page_down-indication-element.png';
// import { resetAllApplicationState } from 'utils/localStore';
// import { FlowContext } from 'reducer/flowReducer';
// import { FormContext } from 'reducer/formReducer';
// import { useContext } from 'react';
// import { UserContext } from 'reducer/userReducer';
// import { LoanFormContext } from 'reducer/loanFormDataReducer';
import { getGeoLocation } from 'utils/helper';
import {
	setGeoLocation,
	reInitializeApplicationSlice,
} from 'store/applicationSlice';
import axios from 'axios';
import * as API from '_config/app.config';
import Button from './Button';
import CardSubProduct from './CardSubProduct';
import { useState } from 'react';
import { useToasts } from './Toast/ToastProvider';
import Modal from 'components/Modal';
import { reInitializeDirectorsSlice } from 'store/directorsSlice';
// import Button from 'components/Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import ExistingCustomerModal from './ExistingCustomerModal';
const Wrapper = styled.div`

  width: 25%;

  border-radius: 10px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  overflow: hidden;
  /* box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%); */
	/* #0b5cff */
	/* rgb(11, 92, 255) */
	/* rgb(11, 92, 255, 0.15) */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px; */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 48px 100px 0px; */
	box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px;
  margin: 0 calc(12% / 6);
	@media (max-width: 700px) {
margin: 1rem 0;
width: 100%;
	}
`;

const DivAdd = styled.div`
	gap: 40px 0;
	padding: 20px 0 20px 0;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	/* @media (max-width: 700px) {
		gap: 0;
	} */
	/* gap: 50px; */
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;

const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

const ImgDiv = styled.div`
	width: 100%;
	height: 250px;
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const ImgSelectProduct = styled.img`
	height: 35px;
	margin: 0 auto;
`;

const InputWrapper = styled.input`
	text-align: left;
	box-sizing: border-box;
	padding: 20px;
	margin-bottom: 25px;
	border: 1px solid #ccc;
	border-radius: 4px;
	//width: 500px;
	//height: 91px;
	width: 100%;
	max-width: 800px;
`;

const SelectWrapper = styled.select`
	text-align: left;
	box-sizing: border-box;
	padding: 20px;
	margin-bottom: 25px;
	border: 1px solid #ccc;
	border-radius: 4px;
	//	width: 500px;
	width: 100%;
	max-width: 800px;
`;

const ResponsiveWrapper = styled.div`
	width: 100%;
`;

// const ButtonBox = styled.div`
//   /* background: ${({ theme }) => theme.themeColor1}; */
//   text-align: center;
//   padding: 40px;
//   padding: 20px;
// `;

// const Link = styled.a`
// 	text-decoration: none;
// 	color: #fff;
// 	background: ${({ theme }) => theme.main_theme_color};
// 	padding: 5px 40px;
// 	display: inline-block;
// 	border-radius: 20px;
// 	cursor: pointer;
// `;

const Description = styled.div`
	color: ${({ theme }) => theme.themeColor2};
	padding: 10px 0;
`;

const ProductName = styled.div`
	text-align: center;
	padding-top: 50px;
	color: #4e4e4e;
	font-weight: bold;
`;

const ButtonWrapper = styled.div`
	text-align: center;
	padding-top: 20px;
	padding-bottom: 20px;
`;

export default function Card({ product, add, setAddedProduct, setAddProduct }) {
	// const {
	// 	state: { basePageUrl },
	// 	actions: { clearFlowDetails },
	// } = useContext(FlowContext);
	// const {
	// 	actions: { clearFormData },
	// } = useContext(FormContext);
	// const {
	// 	actions: { resetUserDetails },
	// } = useContext(UserContext);
	const { app } = useSelector(state => state);
	const { isGeoTaggingEnabled } = app;
	const { userToken } = app;
	// const [addedSubProduct, setAddedSubProduct] = useState(null);
	// const {
	// 	actions: { removeAllLoanDocuments },
	// } = useContext(LoanFormContext);
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [isSubProductModalOpen, setSubProductModalOpen] = useState(false);
	const [isExistingCustomerModalOpen, setExistingCustomerModalOpen] = useState(
		false
	);
	const [isCustomerDetailsModalOpen, setCustomerDetailsModalOpen] = useState(
		true
	);

	// const [SubProduct, setAddedSubProduct]= useState(false);
	// const history = useHistory();
	const [gettingGeoLocation, setGettingGeoLocation] = useState(false);
	// const { url } = useRouteMatch();

	// const handleClick = (e, id) => {
	// 	e.preventDefault();
	// 	history.push({
	// 		pathname: `/applyloan/product/${btoa(id)}`,
	// 		data: id,
	// 	});
	// };
	return (
		<Wrapper>
			<ImgDiv>
				<Img src={product.url} alt={product.name} />
				<ImgSelectProduct src={imgSelectProduct} alt='product' />
			</ImgDiv>
			<ProductName>{product.name}</ProductName>
			{/* <ButtonBox> */}
			<ButtonWrapper>
				<Button
					roundCorner={true}
					loading={gettingGeoLocation}
					fill
					customStyle={{
						padding: '3px 0 3px 0',
						maxWidth: '145px',
						fontSize: '16px',
						background: 'rgb(42, 42, 221)',
					}}
					// customStyle={{ maxHeight: '40px', maxWidth: '130px' }}
					name={add ? 'Add Loan' : 'Get Loan'}
					onClick={async e => {
						dispatch(reInitializeApplicationSlice());
						dispatch(reInitializeDirectorsSlice());
						// if(!!product?.sub_products){setSubProductModalOpen(true);}
						if (!add) {
							try {
								if (
									product?.sub_products &&
									product?.sub_products?.length > 0
								) {
									setSubProductModalOpen(true);
								}
								if (isGeoTaggingEnabled) {
									setGettingGeoLocation(true);
									const coordinates = await getGeoLocation();
									const reqBody = {
										lat: coordinates?.latitude,
										long: coordinates?.longitude,
									};
									// console.log(userToken);

									const geoLocationRes = await axios.post(
										API.GEO_LOCATION,
										reqBody,
										{
											headers: {
												Authorization: `Bearer ${userToken}`,
											},
										}
									);
									dispatch(setGeoLocation(geoLocationRes?.data?.data));
								}
							} catch (e) {
								console.error(
									e?.response?.data?.message,
									e?.message || 'Permission denied'
								);
								dispatch(
									setGeoLocation({
										err: 'Geo Location Not Captured',
									})
								);
								addToast({
									message:
										e?.response?.data?.message ||
										'Geo Location failed! Please enable your location and try again.',
									type: 'error',
								});
								return;
							} finally {
								setGettingGeoLocation(false);
							}
						}
						// if (product.loan_request_type === 2) {
						if (add) {
							setAddedProduct(product);
							setAddProduct(false);
							// if (
							// 	!!product?.sub_products &&
							// 	product?.sub_products?.length > 0
							// ) {
							// 	setSubProductModalOpen(true);
							// }
							return;
						}
						e.preventDefault();
						sessionStorage.clear();
						const params = queryString.parse(window.location.search);
						let redirectURL = `/nconboarding/applyloan/product/${btoa(
							product.id
						)}`;
						if (params?.token) {
							redirectURL += `?token=${params.token}`;
						}
						// window.open(redirectURL, '_self');
						if (
							!product?.sub_products ||
							product?.sub_products?.length === 0 ||
							isSubProductModalOpen
						) {
							window.open(redirectURL, '_self');
						}
						return;
						// }
						// resetAllApplicationState();
						// clearFlowDetails(basePageUrl);
						// clearFormData();
						// resetUserDetails();
						// removeAllLoanDocuments();
						// !add ? handleClick(e, product.id) : setAddedProduct(product);
						// setAddProduct && setAddProduct(false);
					}}
				>
					{/* {add ? 'Add Loan' : 'Get Loan'} */}
				</Button>
				{/* {add ? 'Add Loan' : 'Get Loan'} */}
				{/* </Button> */}
				<Description>{product.description}</Description>
			</ButtonWrapper>
			<Modal
				show={isSubProductModalOpen}
				onClose={() => setSubProductModalOpen(false)}
				width='50%'
				height='70%'
			>
				<ImgClose
					onClick={() => {
						setSubProductModalOpen(false);
					}}
					src={imgClose}
					alt='close'
				/>
				<span
					style={{
						font: '30px Arial, sans-serif',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					Change Sub Product
				</span>
				<section className='flex flex-col gap-y-8'>
					<DivAdd>
						{product &&
							product?.sub_products &&
							product?.sub_products.map((subProduct, idx) => {
								// if(idx<initialLoanProductCount) return null;
								// console.log(product+"-> "+subProduct);
								return (
									<CardSubProduct
										add={add}
										setAddedProduct={setAddProduct}
										product={subProduct}
										key={`product__${subProduct.id}`}
										setAddProduct={setAddedProduct}
									/>
								);
							})}
					</DivAdd>
				</section>
			</Modal>
			{/* TODO: siddhi to complete coustomer details modal */}
			<Modal
				show={isCustomerDetailsModalOpen}
				onClose={() => setCustomerDetailsModalOpen(false)}
				width='50%'
				height='70%'
			>
				<ImgClose
					onClick={() => {
						setCustomerDetailsModalOpen(false);
					}}
					src={imgClose}
					alt='close'
				/>
				<ResponsiveWrapper>
					<form
						style={{
							textAlign: 'center',
							display: 'flex',
							flexDirection: 'column',
							maxWidth: '600px',
							margin: '0 auto ',
							padding: '30px',
						}}
					>
						<span
							style={{
								font: '30px Arial, sans-serif',
								display: 'flex',
								justifyContent: 'left',
								color: '#4E4E4E',
								marginBottom: '30px',
							}}
						>
							Customer Details
						</span>
						<SelectWrapper id='customer_type'>
							<option value='' disabled selected>
								Customer Type
							</option>
							<option value='option1'>Option 1</option>
							<option value='option2'>Option 2</option>
							<option value='option3'>Option 3</option>
						</SelectWrapper>

						<InputWrapper
							type='text'
							id='pan_no'
							placeholder='PAN Number'
							required
						/>

						<InputWrapper
							type='number'
							id='mobile_no'
							placeholder='Mobile Number'
							required
						/>
						<Button
							name='Proceed'
							onClick={() => {
								setExistingCustomerModalOpen(true);
								setCustomerDetailsModalOpen(false);
							}}
							customStyle={{ alignSelf: 'flex-end' }}
							fill
						/>
					</form>
				</ResponsiveWrapper>
			</Modal>
			{isExistingCustomerModalOpen && (
				<ExistingCustomerModal
					show={isExistingCustomerModalOpen}
					onClose={() => {
						setExistingCustomerModalOpen(false);
					}}
				/>
			)}
		</Wrapper>
	);
}
