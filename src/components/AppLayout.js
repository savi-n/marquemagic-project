/* App layout like color, theme and logo and routes are defined in this section  */

import { useEffect, useState, useContext, Suspense, lazy } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import queryString from 'query-string';

import GlobalStyle from '../components/Styles/GlobalStyles';
import Header from './Header';
import Loading from './Loading';
import useFetch from '../hooks/useFetch';

import {
	WHITE_LABEL_URL,
	CLIENT_VERIFY_URL,
	CLIENT_EMAIL_ID,
	BANK_TOKEN_API,
	NC_STATUS_CODE,
	//APP_DOMAIN,
	APP_CLIENT,
	API_END_POINT,
} from '../_config/app.config.js';
import { AppContext } from '../reducer/appReducer';
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
			try {
				if (params.loan_ref_id && params.token) {
					const loanDetailsRes = await axios.get(
						`${API_END_POINT}/getDetailsWithLoanRefId?loan_ref_id=${
							params.loan_ref_id
						}`
					);
					const isViewLoan = params.view ? true : false;
					sessionStorage.setItem(
						'editLoan',
						JSON.stringify({ ...loanDetailsRes?.data?.data, isViewLoan } || {})
					);
				}
			} catch (error) {
				console.error('error-getDetailsWithLoanRefId-', error);
			}
			try {
				if (params.cid || params.uid) {
					let UID = params.cid || params.uid;
					UID = UID.replaceAll(' ', '+');
					// console.log('UID-before-', UID);
					const newUID = decryptRes(UID);
					// const newUID = decryptUID(UID.toString());
					// console.log('UID-after-', newUID);
					const userRes = await axios.get(
						`${API_END_POINT}/usersDetails?userid=${newUID}${
							params.token ? `&token=${params.token}` : ''
						}`
						// console.log('header-userRes', userRes);
					);
					const userDetails = userRes?.data?.data;
					// console.log('userres-data-', userDetails?.cacompname || '');
					const stringifyUserDetails = JSON.stringify(userDetails);
					if (params.cid) {
						sessionStorage.setItem('corporateDetails', stringifyUserDetails);
					} else if (params.uid) {
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
			setWhitelabelId(response?.permission?.id);
			setLogo(response?.permission?.logo);
			fetchData();
			document.title = response.permission.color_theme_react.page_name || 'App';
		}
		// eslint-disable-next-line
	}, [response]);

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
