/* App layout like color, theme and logo and routes are defined in this section  */

import { useEffect, useState, useContext, Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';

import {
	setEditLoanData,
	setWhiteLabelId as appSetWhiteLabelId,
} from 'store/appSlice';
import GlobalStyle from '../components/Styles/GlobalStyles';
import Header from './Header';
import Loading from './Loading';
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
} from '_config/app.config.js';
import { AppContext } from 'reducer/appReducer';
import imgProductBg from 'assets/images/bg/Landing_page_blob-element.png';
import { decryptRes } from 'utils/encrypt';

const HeaderWrapper = styled.div`
  min-height: 80px;
  max-height: 80px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  /* box-shadow: 0px 2px 5px 1px rgb(11 92 255 / 20%); */
	box-shadow: rgba(11, 92, 255, 0.16) 0px 2px 5px 1px;
  display: flex;
  align-items: center;
  padding: 0 50px;
  z-index: 101;
	position: sticky;
	top: 0px;
	background:#fff;

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
// const BranchUserContent = lazy(() => import('./BranchUserContent'));

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
				if (params?.token) {
					const loanDetailsRes = await axios.get(
						`${API_END_POINT}/getDetailsWithLoanRefId?loan_ref_id=${
							decryptedToken.loan_ref_id
						}`
					);
					const isEditLoan = decryptedToken.edit ? true : false;
					const newEditLoanData =
						{
							...loanDetailsRes?.data?.data,
							isEditLoan,
							token: decryptedToken.token,
						} || {};

					// Request URL: http://3.108.54.252:1337/viewloanlisting?skip=0&limit=5&search=COIT00246086
					if (loanDetailsRes?.data?.data?.lender_document?.length > 0) {
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
					dispatch(setEditLoanData(newEditLoanData));

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
								{/* <Route
									path='/branch'
									manager={true}
									component={BranchUserContent}
								/> */}
								<Route path='/applyloan' component={ApplyLoanContent} />
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
