/* App layout like color, theme and logo and routes are defined in this section  */

import { useEffect, useState, useContext, Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';

import {
	setEditLoanData,
	setUserDetails,
	setWhiteLabelId as appSetWhiteLabelId,
	setClientToken as appSetClientToken,
	// reInitializeAppSlice,
	setUserToken,
} from 'store/appSlice';
import {
	// reInitializeApplicationSlice,
	setLoanIds,
	addOrUpdateCacheDocuments,
	clearCacheDraftModeSectionsData,
} from 'store/applicationSlice';
import {
	// reInitializeApplicantCoApplicantSlice,
	setEditLoanApplicantsData,
	setSelectedApplicantCoApplicantId,
} from 'store/applicantCoApplicantsSlice';
import GlobalStyle from '../components/Styles/GlobalStyles';
import Header from 'components/Header';
import Loading from 'components/Loading';
import useFetch from 'hooks/useFetch';

import {
	WHITE_LABEL_URL,
	CLIENT_VERIFY_URL,
	CLIENT_EMAIL_ID,
	BANK_TOKEN_API,
	NC_STATUS_CODE,
	//APP_DOMAIN,
	APP_CLIENT,
	API_END_POINT,
	WHITELABEL_ENCRYPTION_API,
	GE_LOAN_DETAILS_WITH_LOAN_REF_ID,
} from '_config/app.config.js';
import { AppContext } from 'reducer/appReducer';
import imgProductBg from 'assets/images/bg/Landing_page_blob-element.png';
import { decryptRes } from 'utils/encrypt';
import * as CONST_EMI_DETAILS from 'components/Sections/EMIDetails/const';
import * as CONST_BANK_DETAILS from 'components/Sections/BankDetails/const';
import * as CONST_SECTIONS from 'components/Sections/const';
import { formatLoanDocuments } from 'utils/formatData';

const HeaderWrapper = styled.div`
  min-height: 80px;
  max-height: 80px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  /* box-shadow: 0px 2px 5px 1px rgb(11 92 255 / 20%); */
	box-shadow: rgba(11, 92, 255, 0.16) 0px 2px 5px 1px;
  /* display: flex; */
  /* align-items: center; */
  /* padding: 0 50px; */
  z-index: 101;
	position: sticky;
	top: 0px;
	background:#fff;
	/* @media (max-width: 700px) {
		flex-direction: column;
		justify-content: center;
	} */
`;
const Div = styled.div`
	flex: 1;
	background-image: url(${imgProductBg}) no-repeat center center fixed;
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;
`;

const ApplyLoanContent = lazy(() => import('./ApplyLoanContent'));
// const SomethingWentWrong = lazy(() => import('./SomethingWentWrong'));

const AppLayout = () => {
	const dispatch = useDispatch();
	const { response, newRequest } = useFetch({
		url: WHITE_LABEL_URL({ name: APP_CLIENT }),
	});

	const {
		actions: { setClientToken, setBankToken, setWhitelabelId, setLogo },
	} = useContext(AppContext);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const res = await newRequest(CLIENT_VERIFY_URL, {
					method: 'POST',
					data: {
						email: CLIENT_EMAIL_ID,
						white_label_id: response.permission.id,
					},
				});

				const clientId = res.data;
				dispatch(appSetClientToken(clientId.token));
				if (clientId?.statusCode === 200) {
					const bankToken = await newRequest(
						BANK_TOKEN_API,
						{
							method: 'POST',
							data: {
								type: 'BANK',
								linkRequired: false,
								isEncryption: false,
							},
						},
						{
							Authorization: clientId.token,
						}
					);

					if (bankToken?.data?.statusCode === NC_STATUS_CODE.NC200) {
						setClientToken(clientId.token);
						setBankToken(
							bankToken?.data.generated_key,
							bankToken?.data.request_id
						);
					}
				}
			} catch (error) {
				console.error('ERROR-CLIENT_VERIFY_URL-', error);
				return;
			}
			// when user comes for create / editing this loan from ui-ux
			const params = queryString.parse(window.location.search);
			let decryptedToken = {};
			try {
				decryptedToken = decryptRes(params?.token?.replaceAll(' ', '+'));
				if (params?.token && decryptedToken.loan_ref_id) {
					const loanDetailsRes = await axios.get(
						`${GE_LOAN_DETAILS_WITH_LOAN_REF_ID}?loan_ref_id=${
							decryptedToken.loan_ref_id
						}`
					);
					const isEditLoan = decryptedToken.edit ? true : false;
					const isViewLoan = !isEditLoan;
					const newEditLoanData =
						{
							..._.cloneDeep(loanDetailsRes?.data?.data),
							isEditLoan,
							token: decryptedToken.token,
						} || {};

					// Request URL: http://3.108.54.252:1337/viewloanlisting?skip=0&limit=5&search=COIT00246086
					if (
						isViewLoan &&
						loanDetailsRes?.data?.data?.lender_document?.length > 0
					) {
						const viewLoanDetailsRes = await axios.get(
							`${API_END_POINT}/viewloanlisting?skip=0&limit=5&search=${
								decryptedToken.loan_ref_id
							}`,
							{
								headers: {
									Authorization: `Bearer ${decryptedToken.token}`,
								},
							}
						);
						newEditLoanData.lender_document =
							viewLoanDetailsRes?.data?.loan_details?.[0]?.lender_document;
					}
					sessionStorage.setItem('editLoan', JSON.stringify(newEditLoanData));
					sessionStorage.setItem('userToken', decryptedToken.token);
					dispatch(setUserToken(decryptedToken.token));
					dispatch(setEditLoanData({ editLoanData: newEditLoanData }));
					dispatch(
						setEditLoanApplicantsData({ editLoanData: newEditLoanData })
					);
					// TODO: to be removed in M1.5
					const isDraftLoan =
						newEditLoanData?.loan_status_id === 1 &&
						newEditLoanData?.loan_sub_status_id === 1;
					if (isDraftLoan) {
						dispatch(clearCacheDraftModeSectionsData());
						dispatch(
							setSelectedApplicantCoApplicantId(CONST_SECTIONS.APPLICANT)
						);
					}
					// TODO: -- to be removed in M1.5
					dispatch(
						setLoanIds({
							loanRefId: newEditLoanData?.loan_ref_id,
							loanId: newEditLoanData?.id,
							businessId: newEditLoanData?.business_id?.id,
							businessUserId: newEditLoanData?.business_id?.userid,
							loanProductId: newEditLoanData?.loan_product_id,
							createdByUserId: newEditLoanData?.createdUserId,
							loanAssetsId: newEditLoanData?.loan_assets?.[0]?.id,
							assetsAdditionalId: newEditLoanData?.assets_additional_id,
							refId1: newEditLoanData?.reference_details?.[0]?.id,
							refId2: newEditLoanData?.reference_details?.[1]?.id,
							bankDetailsFinId: newEditLoanData?.bank_details?.filter(
								bank =>
									bank?.fin_type === CONST_BANK_DETAILS.FIN_TYPE_BANK_ACCOUNT
							)?.[0]?.id,
							emiDetailsFinId: newEditLoanData?.bank_details?.filter(
								bank =>
									bank?.fin_type ===
									CONST_EMI_DETAILS.FIN_TYPE_OUTSTANDING_LOANS
							)?.[0]?.id,
							businessAddressIdAid1: newEditLoanData?.business_address?.filter(
								address => `${address?.aid}` === '1'
							)?.[0]?.id,
							businessAddressIdAid2: newEditLoanData?.business_address?.filter(
								address => `${address?.aid}` === '2'
							)?.[0]?.id,
						})
					);
					const newDocs = formatLoanDocuments(
						newEditLoanData?.loan_document || []
					);
					// const newLenderDocs = formatLenderDocs(
					// 	newEditLoanData?.lender_document || []
					// );
					// const newDocs = [];
					// newEditLoanData?.loan_document?.map(doc => {
					// 	const newDoc = {
					// 		...(doc?.loan_document_details?.[0] || {}),
					// 		...doc,
					// 		document_id: doc?.id,
					// 		doc_type_id: doc.doctype,
					// 		name: getDocumentNameFromLoanDocuments(doc),
					// 	};
					// 	newDocs.push(newDoc);
					// 	return null;
					// });
					dispatch(addOrUpdateCacheDocuments({ files: newDocs }));

					if (!sessionStorage.getItem('encryptWhiteLabel')) {
						const encryptWhiteLabelReq = await newRequest(
							WHITELABEL_ENCRYPTION_API,
							{
								method: 'GET',
							},
							{ Authorization: `Bearer ${decryptedToken.token}` }
						);

						const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

						sessionStorage.setItem(
							'encryptWhiteLabel',
							encryptWhiteLabelRes.encrypted_whitelabel[0]
						);
					}

					// CreateUser
					// TODO: integrate create-user api for view/edit mode
					// const reqBody = {
					// 	email: formState?.values?.Email || '',
					// 	white_label_id: whiteLabelId,
					// 	source: APP_CLIENT,
					// 	name: formState?.values?.BusinessName,
					// 	mobileNo: formState?.values?.mobileNo,
					// };
					// if (sessionStorage.getItem('userDetails')) {
					// 	try {
					// 		reqBody.user_id =
					// 			JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
					// 	} catch (err) {
					// 		return err;
					// 	}
					// }
					// const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
					// 	method: 'POST',
					// 	data: reqBody,
					// });
					// const userDetailsRes = userDetailsReq.data;
					// sessionStorage.setItem('userToken', userDetailsRes.token);
					// -- CreateUser
				}
			} catch (error) {
				console.error('error-getDetailsWithLoanRefId-', error);
				// window.open('/somethingwentwrong', '_self');
			}
			try {
				if (params.cid || params.uid || decryptedToken?.userId) {
					let UID = params?.cid || params?.uid || '';
					// + sign in the query string is URL-decoded to a space. %2B in the query string is URL-decoded to a + sign.
					UID = UID?.replaceAll(' ', '+');
					// console.log('UID-before-', UID);
					const newUID = decryptedToken?.userId || decryptRes(UID);
					// const newUID = decryptUID(UID.toString());
					// console.log('UID-after-', newUID);
					const userRes = await axios.get(
						`${API_END_POINT}/usersDetails?userid=${newUID}`
						// console.log('header-userRes', userRes);
					);
					const userDetails = userRes?.data?.data;
					// console.log('userres-data-', userDetails);
					dispatch(setUserDetails(userDetails));
					if (decryptedToken?.token) {
						dispatch(setUserToken(decryptedToken?.token));
						sessionStorage.setItem('userToken', decryptedToken?.token);
					}
					const stringifyUserDetails = JSON.stringify(userDetails);
					if (params.cid) {
						sessionStorage.setItem('corporateDetails', stringifyUserDetails);
					} else {
						// console.log('uid-passed-', { params, stringifyUserDetails });
						sessionStorage.setItem('userDetails', stringifyUserDetails);
					}
				}
			} catch (error) {
				console.error('error-userdetails-', error);
			}
			setLoading(false);
		}
		if (response) {
			// dispatch(reInitializeAppSlice());
			// dispatch(reInitializeApplicantCoApplicantSlice());
			// dispatch(reInitializeApplicationSlice());
			sessionStorage.setItem('wt_lbl', response?.permission?.id);
			dispatch(appSetWhiteLabelId(response?.permission?.id));

			sessionStorage.setItem(
				'permission',
				JSON.stringify(response?.permission)
			);

			setWhitelabelId(response?.permission?.id);
			setLogo(response?.permission?.logo);
			fetchData();
			document.title = response.permission.color_theme_react.page_name || 'App';
		}
		// eslint-disable-next-line
	}, [response]);

	// Test loader here
	// return <Loading />;

	return loading ? (
		<Loading />
	) : (
		response && (
			<ThemeProvider theme={response.permission.color_theme_react}>
				<GlobalStyle />
				{!window.location.href.includes('branch') && (
					<HeaderWrapper>
						<Header
							logo={response.permission.logo}
							openAccount={
								response?.permission?.color_theme_react?.openAccount?.status
							}
							openAccountLink={
								response?.permission?.color_theme_react?.openAccount?.link
							}
							logoLink={response?.permission?.color_theme_react?.logoLink}
						/>
					</HeaderWrapper>
				)}
				<Div>
					<BrowserRouter basename='/nconboarding'>
						<Suspense fallback={<Loading />}>
							<Switch>
								<Route path='/applyloan' component={ApplyLoanContent} />
								{/* <Route
									path='/somethingwentwrong'
									component={SomethingWentWrong}
									exact
								/> */}
								<Route render={() => <Redirect to='/applyloan' />} />
							</Switch>
						</Suspense>
					</BrowserRouter>
				</Div>
			</ThemeProvider>
		)
	);
};

export default AppLayout;
