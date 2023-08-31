/* App layout like color, theme and logo and routes are defined in this section  */

import { useEffect, useState, useContext, Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';
// import _ from 'lodash';

import {
	// setEditLoanData,
	setEditOrViewLoan,
	setUserDetails,
	setWhiteLabelId as appSetWhiteLabelId,
	setClientToken as appSetClientToken,
	setPermission,
	setUserToken,
	reInitializeAppSlice,
} from 'store/appSlice';
import {
	// setGeoLocation,
	setLoanIds,
	// addOrUpdateCacheDocuments,
	// clearCacheDraftModeSectionsData,
} from 'store/applicationSlice';
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
	FEDERAL_TRANSACTION_KYC_API,
	// WHITELABEL_ENCRYPTION_API,
	// GE_LOAN_DETAILS_WITH_LOAN_REF_ID,
} from '_config/app.config.js';
import { AppContext } from 'reducer/appReducer';
import imgProductBg from 'assets/images/bg/Landing_page_blob-element.png';
import { decryptRes } from 'utils/encrypt';
// import * as CONST_EMI_DETAILS from 'components/Sections/EMIDetails/const';
// import * as CONST_BANK_DETAILS from 'components/Sections/BankDetails/const';

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
		console.log('app-slice');
		dispatch(reInitializeAppSlice());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
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
			const transactionId = params?.transaction_id;
			if (transactionId) {
				handleFederalBankRequest(transactionId);
			}
			let decryptedToken = {};
			decryptedToken = decryptRes(params?.token?.replaceAll(' ', '+'));
			const isEditLoan = decryptedToken?.edit ? true : false;
			const isViewLoan = !isEditLoan && !decryptedToken?.create;

			// set the values for new flow
			dispatch(setUserToken(decryptedToken?.token));

			if (decryptedToken?.loan_ref_id) {
				dispatch(
					setLoanIds({
						loanRefId: decryptedToken?.loan_ref_id,
					})
				);

				dispatch(
					setEditOrViewLoan({
						isEditLoan,
						isViewLoan,
					})
				);
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
			sessionStorage.setItem('wt_lbl', response?.permission?.id);
			dispatch(appSetWhiteLabelId(response?.permission?.id));
			dispatch(setPermission(response?.permission || {}));

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

	const handleFederalBankRequest = async transactionId => {
		try {
			const resp = await newRequest(FEDERAL_TRANSACTION_KYC_API, {
				method: 'POST',
				data: {
					transaction_id: transactionId,
				},
			});
			// console.log(resp.data, 'federal bank redirection kyc to backend resp');
			return resp;
		} catch (error) {
			console.error(error);
		}
	};
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
