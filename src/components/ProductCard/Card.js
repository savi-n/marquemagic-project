/* Landing page of nc-onboarding journey contains different loan cards.
This card is designed and defined here */
import { useSelector, useDispatch } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import imgSelectProduct from 'assets/images/bg/Landing_page_down-indication-element.png';
import { getGeoLocation } from 'utils/helper';
import {
	setGeoLocation,
	reInitializeApplicationSlice,
	setLeadId,
	setSelectedProductIdFromLead,
} from 'store/applicationSlice';
import * as API from '_config/app.config';
import CardSubProduct from '../CardSubProduct';
import { useState } from 'react';
import { useToasts } from '../Toast/ToastProvider';
import Modal from 'components/Modal';
import { reInitializeDirectorsSlice } from 'store/directorsSlice';
import { encryptReq } from 'utils/encrypt';
import Button from 'components/Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import CustomerListModal from './CustomerListModal';
import CustomerDetailsFormModal from './CustomerDetailsFormModal';
import CustomerVerificationOTPModal from './CustomerVerificationOTPModal';
import * as UI from './ui';
import { useEffect } from 'react';
import { resetEditOrViewLoan } from 'store/appSlice';
import * as CONST from './const';

export default function Card({
	product,
	add,
	setAddedProduct,
	setAddProduct,
	isCustomerDetailsFormModalOpenDuplicate,
	setIsCustomerDetailsFormModalOpenDuplicate,
	isSubProductModalOpenDuplicate,
	setSubProductModalOpenDuplicate,
	// subProduct,
	// setSubProduct,
	// isSubProductModalOpen,
	// setSubProductModalOpen,
}) {
	// console.log({ product, productName: product?.name }, '-444-Card.js');

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const { app, application } = useSelector(state => state);
	const {
		isGeoTaggingEnabled,
		userToken,
		userDetails,
		permission,
		whiteLabelId,
	} = app;
	const { geoLocation, leadId } = application;
	const [isSubProductModalOpen, setSubProductModalOpen] = useState(false);

	const [
		isCustomerDetailsFormModalOpen,
		setIsCustomerDetailsFormModalOpen,
	] = useState(false);
	const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
	const [customerList, setCustomerList] = useState([]);
	const [gettingGeoLocation, setGettingGeoLocation] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [customerId, setCustomerId] = useState('');
	const [
		isCustomerVerificationOTPModal,
		setIsCustomerVerificationOTPModal,
	] = useState(false);
	const [sendingOTP, setSendingOTP] = useState(false);
	const [sendOtpRes, setSendOtpRes] = useState(null);
	const [customerDetailsFormData, setCustomerDetailsFormData] = useState(null);
	const [selectedDedupeData, setSelectedDedupeData] = useState({});
	const [subProduct, setSubProduct] = useState({});
	const [productModalData, setProductModalData] = useState({});

	// const handleClick = (e, id) => {
	// 	e.preventDefault();
	// 	history.push({
	// 		pathname: `/applyloan/product/${btoa(id)}`,
	// 		data: id,
	// 	});
	// };
	// console.log(
	// 	{ selectedDedupeData, product, customerDetailsFormData },
	// 	'card.js'
	// );
	// console.log('Card-allstates-', { product });
	useEffect(() => {
		// console.log('card.js - useeffect-');
		dispatch(resetEditOrViewLoan());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const redirectToProductPage = (productForModal = product) => {
		// console.log(
		// 	'🚀 ~ file: Card.js:79 ~ redirectToProductPage ~ productForModal:',
		// 	productForModal
		// );
		// sessionStorage.clear();
		const params = queryString.parse(window.location.search);
		let redirectURL = `/nconboarding/applyloan/product/${btoa(
			productForModal.id
		)}`;
		if (params?.token) {
			redirectURL += `?token=${params.token}`;
		}
		if (
			!productForModal?.sub_products ||
			productForModal?.sub_products?.length === 0 ||
			isSubProductModalOpen
		) {
			window.open(redirectURL, '_self');
		}
		return;
	};

	const redirectToProductPageInEditMode = (
		loanData,
		productForModal = product
	) => {
		if (!loanData?.data?.loan_data?.loan_ref_id) {
			addToast({
				message: 'Something went wrong, try after sometime',
				type: 'error',
			});
			return;
		}
		// sessionStorage.clear();
		const editLoanRedirectObject = {
			userId: userDetails?.id,
			loan_ref_id: loanData?.data?.loan_data?.loan_ref_id,
			token: userToken,
			edit: true,
		};
		const redirectURL = `/nconboarding/applyloan/product/${btoa(
			productModalData?.id || productForModal?.id || product?.id
		)}?token=${encryptReq(editLoanRedirectObject)}`;
		// console.log('redirectToProductPageInEditMode-obj-', {
		// 	editLoanRedirectObject,
		// 	redirectURL,
		// 	loanData,
		// 	product,
		// });
		window.open(redirectURL, '_self');
	};

	const redirectToProductPageInEditModeFromLeadId = (
		productForModal = product
	) => {
		if (!leadId) {
			addToast({
				message: 'Something went wrong, try after sometime',
				type: 'error',
			});
			return;
		}
		const editLoanRedirectObject = {
			userId: userDetails?.id,
			lead_id: leadId,
			token: userToken,
			edit: true,
		};
		const redirectURL = `/nconboarding/applyloan/product/${btoa(
			productModalData?.id || productForModal?.id || product?.id
		)}?token=${encryptReq(editLoanRedirectObject)}`;
		// console.log('redirectToProductPageInEditMode-obj-', {
		// 	editLoanRedirectObject,
		// 	redirectURL,
		// 	loanData,
		// 	product,
		// });
		window.open(redirectURL, '_self');
		dispatch(setLeadId(''));
		dispatch(setSelectedProductIdFromLead(''));
	};

	// Send/Generate/Re-Send OTP
	const onProceedSelectCustomer = async () => {
		try {
			setSendingOTP(true);
			// const reqBody = {
			// 	customer_id:
			// 		customerList?.filter(
			// 			c => c.customer_id === selectedCustomer?.customer_id
			// 		)?.[0]?.customer_id || '137453244',
			// };
			// const sendOtpRes = await axios.post(API.DDUPE_SEND_OTP, reqBody);
			// console.log({ customerList, selectedCustomer });
			const customerId =
				customerList?.filter(
					c => c.customer_id === selectedCustomer?.customer_id
				)?.[0]?.customer_id || ''; // '137453244';
			setCustomerId(customerId);
			// console.log({ customerId, selectedDedupeData });
			if (selectedDedupeData?.is_otp_required) {
				try {
					const sendOtpRes = await axios.post(
						selectedDedupeData?.generate_otp,
						{
							customer_id: customerId,
						},
						{
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);

					setSendOtpRes(sendOtpRes?.data?.data || {});
					// console.log('Card-sendOtpRes-', { sendOtpRes });
					setIsCustomerListModalOpen(false);
					setIsCustomerVerificationOTPModal(true);
					// setSelectedCustomer(null);
					addToast({
						message: sendOtpRes?.data?.message || 'OTP Sent Successfully',
						type: 'success',
					});
				} catch (err) {
					console.error(err.message);
					addToast({
						message: err.message || 'Otp generation failed!',
						type: 'error',
					});
				}
			} else {
				// fetch api call for dedupe existing user
				try {
					const reqBody = {
						customer_id: customerId,
						white_label_id: whiteLabelId,
						businesstype: customerDetailsFormData?.businesstype || '',
						loan_product_id:
							productModalData?.product_id?.[
								customerDetailsFormData?.businesstype
							] ||
							product?.product_id?.[customerDetailsFormData?.businesstype] ||
							'',
						loan_product_details_id:
							productModalData?.id || product?.id || undefined,
						parent_product_id:
							productModalData?.parent_id || product?.parent_id || undefined,
						isApplicant: true, //implemented based on savitha's changes - bad practice
						type_name:
							`${productModalData?.loan_request_type ||
								product?.loan_request_type}` === '2'
								? 'Applicant'
								: CONST.TYPE_NAME_MAPPING[
										(customerDetailsFormData?.businesstype)
								  ] || '',
						origin: API.ORIGIN,
						lat: geoLocation?.lat || '',
						long: geoLocation?.long || '',
						timestamp: geoLocation?.timestamp || '',
					};
					const verifyData = await axios.post(
						selectedDedupeData?.verify,
						reqBody,
						{
							headers: {
								Authorization: `Bearer ${userToken}`,
							},
						}
					);
					// console.log(
					// 	'🚀 ~ file: Card.js:193 ~ onProceedSelectCustomer ~ verifyData:',
					// 	verifyData
					// );

					// console.log({ verifyData });
					if (verifyData?.data?.status === 'ok') {
						redirectToProductPageInEditMode(verifyData?.data, productModalData);
					}
					if (verifyData?.data?.status === 'nok') {
						addToast({
							message:
								verifyData?.data?.message ||
								verifyData?.data?.Message ||
								'Something Went Wrong, Please check the selected/entered details.',
							type: 'error',
						});
					}
				} catch (err) {
					console.error(err.message);
					addToast({
						message:
							err?.response?.data?.message ||
							err?.response?.data?.Message ||
							err.message ||
							'Otp generation failed!',
						type: 'error',
					});
				}
				// console.log('else-part-no-otp');
			}
		} catch (e) {
			console.error('error-onSelectCustomer-', e);
		} finally {
			setSendingOTP(false);
		}
	};

	return (
		<UI.Wrapper>
			<UI.ImgDiv>
				<UI.Img src={product?.url} alt={product?.name} />
				<UI.ImgSelectProduct src={imgSelectProduct} alt='product' />
			</UI.ImgDiv>
			<UI.ProductName>{product?.name}</UI.ProductName>
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
					name={
						add
							? 'Add Loan'
							: permission?.solution_type === 'CaseDOS'
							? 'Create Order'
							: 'Get Loan'
					}
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
									// console.log({ product }, 'onclick-subproductmodal');
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
									// console.log(geoLocationRes, 'GeoLocation CArd Product');
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
										'Geo Location failed! Please enable your location, Post enabeling, reopen the browser and try again.',
									type: 'error',
								});
								return;
							} finally {
								setGettingGeoLocation(false);
							}
						}
						// if (product?.loan_request_type === 2) {
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
							if (!leadId && product?.product_details?.is_lead_product) {
								return redirectToProductPage();
							}
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
						// !add ? handleClick(e, product?.id) : setAddedProduct(product);
						// setAddProduct && setAddProduct(false);
					}}
				>
					{/* {add ? 'Add Loan' : 'Get Loan'} */}
				</Button>
				{/* {add ? 'Add Loan' : 'Get Loan'} */}
				{/* </Button> */}
				<UI.Description>{product?.description}</UI.Description>
			</UI.ButtonWrapper>
			<Modal
				show={isSubProductModalOpen || isSubProductModalOpenDuplicate}
				onClose={() => {
					setSubProductModalOpen(false);
					setSubProductModalOpenDuplicate(false);
					// setCustomerDetailsFormData(null);
					// setSelectedDedupeData({});
				}}
				width='90%'
				height='70%'
				padding='50px'
			>
				<UI.ImgClose
					onClick={() => {
						setSubProductModalOpen(false);
						setSubProductModalOpenDuplicate(false);
					}}
					src={imgClose}
					alt='close'
				/>
				<span
					style={{
						font: '30px Arial, sans-serif',
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '70px',
					}}
				>
					Choose Sub Product
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
										setSubProduct={setSubProduct}
										setIsCustomerDetailsFormModalOpen={
											setIsCustomerDetailsFormModalOpen
										}
									/>
								);
							})}
					</UI.DivAdd>
				</section>
			</Modal>
			{(isCustomerDetailsFormModalOpen ||
				isCustomerDetailsFormModalOpenDuplicate) && (
				<CustomerDetailsFormModal
					show={
						isCustomerDetailsFormModalOpen ||
						isCustomerDetailsFormModalOpenDuplicate
					}
					onClose={() => {
						setIsCustomerDetailsFormModalOpen(false);
						setIsCustomerDetailsFormModalOpenDuplicate(false);
						// setCustomerDetailsFormData(null);
						// setSelectedDedupeData({});
					}}
					redirectToProductPage={redirectToProductPage}
					product={product}
					setCustomerList={setCustomerList}
					setIsCustomerListModalOpen={setIsCustomerListModalOpen}
					setCustomerDetailsFormData={setCustomerDetailsFormData}
					selectedDedupeData={selectedDedupeData}
					setSelectedDedupeData={setSelectedDedupeData}
					subProduct={subProduct}
					setProductModalData={setProductModalData}
					redirectToProductPageInEditMode={redirectToProductPageInEditMode}
					redirectToProductPageInEditModeFromLeadId={
						redirectToProductPageInEditModeFromLeadId
					}
				/>
			)}
			{isCustomerListModalOpen && (
				<CustomerListModal
					show={isCustomerListModalOpen}
					onClose={() => {
						setIsCustomerDetailsFormModalOpen(false);
						setIsCustomerListModalOpen(false);
						setSelectedCustomer(null);
						setIsCustomerDetailsFormModalOpenDuplicate(false);
						// setTempProduct({});
						// setCustomerDetailsFormData(null);
						// setSelectedDedupeData({});
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
					customerId={customerId}
					onClose={() => {
						setIsCustomerVerificationOTPModal(false);
						setIsCustomerListModalOpen(false);
						setIsCustomerDetailsFormModalOpen(false);
						setIsCustomerDetailsFormModalOpenDuplicate(false);
					}}
					selectedCustomer={selectedCustomer}
					resendOtp={onProceedSelectCustomer}
					redirectToProductPageInEditMode={redirectToProductPageInEditMode}
					customerDetailsFormData={customerDetailsFormData}
					product={product}
					sendOtpRes={sendOtpRes}
					subProduct={subProduct}
				/>
			)}
		</UI.Wrapper>
	);
}
