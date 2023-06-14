/* Landing page of nc-onboarding journey contains different loan cards.
This card is designed and defined here */
import { useSelector, useDispatch } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import imgSelectProduct from 'assets/images/bg/Landing_page_down-indication-element.png';
import { getGeoLocation } from 'utils/helper';
import {
	setGeoLocation,
	reInitializeApplicationSlice,
} from 'store/applicationSlice';
import axios from 'axios';
import * as API from '_config/app.config';
import CardSubProduct from '../CardSubProduct';
import { useState } from 'react';
import { useToasts } from '../Toast/ToastProvider';
import Modal from 'components/Modal';
import { reInitializeDirectorsSlice } from 'store/directorsSlice';
import Button from 'components/Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import CustomerListModal from './CustomerListModal';
import CustomerDetailsFormModal from './CustomerDetailsFormModal';
import CustomerVerificationOTPModal from './CustomerVerificationOTPModal';
import * as UI from './ui';

export default function Card({ product, add, setAddedProduct, setAddProduct }) {
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const { app } = useSelector(state => state);
	const { isGeoTaggingEnabled, userToken } = app;
	const [isSubProductModalOpen, setSubProductModalOpen] = useState(false);
	const [
		isCustomerDetailsFormModalOpen,
		setIsCustomerDetailsFormModalOpen,
	] = useState(false);
	const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
	const [customerList, setCustomerList] = useState([]);
	const [gettingGeoLocation, setGettingGeoLocation] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [
		isCustomerVerificationOTPModal,
		setIsCustomerVerificationOTPModal,
	] = useState(false);
	const [sendingOTP, setSendingOTP] = useState(false);

	// const handleClick = (e, id) => {
	// 	e.preventDefault();
	// 	history.push({
	// 		pathname: `/applyloan/product/${btoa(id)}`,
	// 		data: id,
	// 	});
	// };

	console.log('Card-allstates-', { product });

	const redirectToProductPage = () => {
		sessionStorage.clear();
		const params = queryString.parse(window.location.search);
		let redirectURL = `/nconboarding/applyloan/product/${btoa(product.id)}`;
		if (params?.token) {
			redirectURL += `?token=${params.token}`;
		}
		if (
			!product?.sub_products ||
			product?.sub_products?.length === 0 ||
			isSubProductModalOpen
		) {
			window.open(redirectURL, '_self');
		}
		return;
	};

	const redirectToProductPageInEditMode = () => {
		redirectToProductPage();
	};

	const onProceedSelectCustomer = async () => {
		try {
			setSendingOTP(true);
			const reqBody = {
				customer_id:
					customerList?.filter(
						c => c.customer_id === selectedCustomer?.customer_id
					)?.[0]?.customer_id || '137453244',
			};
			const sendOtpRes = await axios.post(API.DDUPE_SEND_OTP, reqBody);
			console.log('Card-sendOtpRes-', { sendOtpRes });
			setIsCustomerListModalOpen(false);
			setIsCustomerVerificationOTPModal(true);
		} catch (e) {
			console.error('error-onSelectCustomer-', e);
		} finally {
			setSendingOTP(false);
		}
	};

	return (
		<UI.Wrapper>
			<UI.ImgDiv>
				<UI.Img src={product.url} alt={product.name} />
				<UI.ImgSelectProduct src={imgSelectProduct} alt='product' />
			</UI.ImgDiv>
			<UI.ProductName>{product.name}</UI.ProductName>
			{/* <ButtonBox> */}
			<UI.ButtonWrapper>
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

						// dduple-check // existing customer information fetch
						if (!!product?.customer_details) {
							setIsCustomerDetailsFormModalOpen(true);
							return;
						}
						// --dduple-check

						// window.open(redirectURL, '_self');
						redirectToProductPage();
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
				<UI.Description>{product.description}</UI.Description>
			</UI.ButtonWrapper>
			<Modal
				show={isSubProductModalOpen}
				onClose={() => setSubProductModalOpen(false)}
				width='50%'
				height='70%'
			>
				<UI.ImgClose
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
					<UI.DivAdd>
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
					</UI.DivAdd>
				</section>
			</Modal>
			{isCustomerDetailsFormModalOpen && (
				<CustomerDetailsFormModal
					show={isCustomerDetailsFormModalOpen}
					onClose={() => {
						setIsCustomerDetailsFormModalOpen(false);
					}}
					redirectToProductPage={redirectToProductPage}
					product={product}
					setCustomerList={setCustomerList}
					setIsCustomerListModalOpen={setIsCustomerListModalOpen}
				/>
			)}
			{isCustomerListModalOpen && (
				<CustomerListModal
					show={isCustomerListModalOpen}
					onClose={() => {
						// setIsCustomerDetailsFormModalOpen(false);
						setIsCustomerListModalOpen(false);
					}}
					customerList={customerList}
					selectedCustomer={selectedCustomer}
					setSelectedCustomer={setSelectedCustomer}
					onProceedSelectCustomer={onProceedSelectCustomer}
					sendingOTP={sendingOTP}
				/>
			)}
			{isCustomerVerificationOTPModal && (
				<CustomerVerificationOTPModal
					show={isCustomerVerificationOTPModal}
					onClose={() => {
						// setIsCustomerVerificationOTPModal(false);
						// setIsCustomerListModalOpen(false);
						setIsCustomerDetailsFormModalOpen(false);
					}}
					selectedCustomer={selectedCustomer}
					resendOtp={onProceedSelectCustomer}
					redirectToProductPageInEditMode={redirectToProductPageInEditMode}
					// aadhaarGenOtpResponse,
					// prePopulateAddressDetailsFromVerifyOtpRes,
					// formState,
					// setVerifyOtpResponseTemp,
				/>
			)}
		</UI.Wrapper>
	);
}
