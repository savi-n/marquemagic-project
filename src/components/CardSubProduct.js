/* Landing page of nc-onboarding journey contains different loan cards.
This card is designed and defined here */
import { useSelector, useDispatch } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import styled from 'styled-components';
// import imgSelectProduct from 'assets/images/bg/Landing_page_down-indication-element.png';
import rightArrowImg from 'assets/icons/right_go_arrowblue.png';
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
// import Button from './Button';
import { useState } from 'react';
import { useToasts } from './Toast/ToastProvider';
import { reInitializeDirectorsSlice } from 'store/directorsSlice';

const Wrapper = styled.div`
max-width: 200px;
margin: 20px;
  border-radius: 10px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  overflow: hidden;
  /* box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%); */
	/* #0b5cff */
	/* rgb(11, 92, 255) */
	/* rgb(11, 92, 255, 0.15) */
	box-shadow: rgb(11, 92, 255, 0.15) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 48px 100px 0px; */
	/* box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px; */
  margin: 0 calc(12% / 6);
	@media (max-width: 700px) {
margin: 1rem 0;
max-width: 100%;
padding: 50px;

	}
`;

const ImgDiv = styled.div`
	width: 100%;
	/* height: 250px; */
`;

const Img = styled.img`
	width: 200px;
	height: 150px;
	object-fit: contain;
	margin: 10px;
`;

// const ImgSelectProduct = styled.img`
// 	height: 35px;
// 	margin: 0 auto;
// `;

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
	/* padding-top: 50px; */
	color: #4e4e4e;
	font-weight: bold;
`;

const ButtonWrapper = styled.div`
	text-align: center;
	padding-top: 20px;
	padding-bottom: 20px;
`;
const RightArrow = styled.img`
	height: 50px;
	cursor: pointer;
	margin: auto;
`;

export default function CardSubProduct({
	product,
	add,
	setAddedProduct,
	setAddProduct,
}) {
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
	// const {
	// 	actions: { removeAllLoanDocuments },
	// } = useContext(LoanFormContext);
	const dispatch = useDispatch();
	const { addToast } = useToasts();

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
				{/* <ImgSelectProduct src={imgSelectProduct} alt='product' /> */}
			</ImgDiv>
			<ProductName>{product.name}</ProductName>
			{/* <ButtonBox> */}
			<ButtonWrapper>
				<RightArrow
					src={rightArrowImg}
					roundCorner={true}
					loading={gettingGeoLocation}
					fill
					// customStyle={{
					// 	padding: '3px 0 3px 0',
					// 	maxWidth: '145px',
					// 	fontSize: '16px',
					// 	background: 'rgb(42, 42, 221)',
					// }}
					// customStyle={{ maxHeight: '40px', maxWidth: '130px' }}
					name='Add loan'
					onClick={async e => {
						dispatch(reInitializeApplicationSlice());
						dispatch(reInitializeDirectorsSlice());
						// setSubProduct(true)
						if (!add) {
							try {
								console.log("rannnnned")
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
								setGeoLocation(null)
							}
						}
						// if (product.loan_request_type === 2) {
						if (add) {
							setAddedProduct(product);
							setAddProduct(false);
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
						window.open(redirectURL, '_self');
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
				</RightArrow>
				{/* {add ? 'Add Loan' : 'Get Loan'} */}
				{/* </Button> */}
				<Description>{product.description}</Description>
			</ButtonWrapper>
		</Wrapper>
	);
}
