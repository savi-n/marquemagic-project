import { Suspense, lazy, useContext, useState, useEffect } from 'react';
import { Route, Switch, useRouteMatch, Link, useHistory } from 'react-router-dom';
import { string } from 'prop-types';
import styled from 'styled-components';

import { v4 as uuidv4 } from 'uuid';

import { PRODUCT_DETAILS_URL } from '../config';
import useFetch from '../hooks/useFetch';
import { StoreContext } from '../utils/StoreProvider';
import Loading from '../components/Loading';
import PersonalDetails from './PersonalDetails';
import CheckBox from '../shared/components/Checkbox/CheckBox';
import AddressDetails from './AddressDetails';
import SubType from './SubType/SubType';
import SubTypeIncome from './SubType/SubTypeIncome';
import SubTypeDocs from './SubType/SubTypeDocs';
import LoanDetailsComponent from './LoanDetailsPage';
import ApplicationSubmitted from './ApplicationSubmitted';

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
`;

const Colom1 = styled.div`
	width: 25%;
	background: ${({ theme }) => theme.buttonColor1};
	color: ${({ theme }) => theme.themeColor1};
	padding: 50px 20px;
	height: calc(100vh - 80px);
`;

const Colom2 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
	display: flex;
	height: calc(100vh - 80px);
	overflow: scroll;
	&::-webkit-scrollbar {
		display: none;
	}
`;

const Head = styled.h4`
	border: ${({ active }) => (active ? '1px solid' : 'none')};
	border-radius: 10px;
	padding: 15px 20px;
	margin: 10px 0;
`;

const Menu = styled.h5`
	border: ${({ active }) => (active ? '1px solid' : 'none')};
	border-radius: 10px;
	padding: 15px 20px;
	margin: 10px 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const LoanDetails = lazy(() => import('../pages/LoanDetails'));
const IdentityVerification = lazy(() => import('../pages/IdentityVerification'));
const DocumentUpload = lazy(() => import('../pages/DocumentUpload'));

export default function Product({ product, page }) {
	const history = useHistory();

	const {
		state: { whiteLabelId }
	} = useContext(StoreContext);

	const { response } = useFetch({
		url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
		options: { method: 'GET' }
	});

	let { path } = useRouteMatch();

	const [coApplicant, setCoApplicant] = useState(false);
	const [gurantor, setGurantor] = useState(false);
	const [subTypeData, setSubTypeData] = useState(null);
	const [addedApplicant, setAddedApplicant] = useState(false);

	var h = history.location.pathname.split('/');
	var activeValue =
		h[h.length - 2] !== (localStorage.getItem(`co-applicants`) || localStorage.getItem('gurantor'))
			? Number(h[h.length - 1])
				? h[h.length - 1]
				: '1'
			: `${subTypeData}/${h[h.length - 1]}`;

	useEffect(() => {
		setCoApplicant(JSON.parse(window.localStorage.getItem('coApplicant')));
		setAddedApplicant(JSON.parse(window.localStorage.getItem('addedCoApplicant')));
		localStorage.removeItem('addedCoApplicant');
	}, []);

	useEffect(() => {
		window.localStorage.setItem('coApplicant', coApplicant);
	}, [coApplicant]);

	useEffect(() => {
		window.localStorage.setItem('addedCoApplicant', addedApplicant);
	}, [addedApplicant]);

	const getPageName = loanDetails => loanDetails && loanDetails.step.filter(el => h[h.length - 1] === el.page);
	const pageName = response && response.data && getPageName(response.data.product_details)[0]?.name;
	const subTypeHandler = subType => {
		var num;
		if (localStorage.getItem(`${subType}`)) {
			localStorage.removeItem(`${subType}`);
		} else {
			localStorage.setItem(`${subType}`, subType);
		}
		setSubTypeData(subType);
		if (subType === 'co-applicants') {
			setCoApplicant(!coApplicant);
			num = 4;
		} else if (subType === 'gurantor') {
			setGurantor(!gurantor);
			num = 7;
		}
		const url = history.location.pathname.includes(`${subType}`)
			? `/product/${product}/${num}`
			: `/product/${product}/${num}/${subType}/1`;
		history.push(url);
	};

	const submitHandler = subType => {
		if (subType === ('co-applicants' || 'gurantor')) {
			subTypeHandler(subType);
			setAddedApplicant(true);
		} else {
			const endpointNum = Number(h[h.length - 1]) + 1;
			h[h.length - 1] = endpointNum.toString();
			const url = h.join('/');
			history.push(url);
			localStorage.removeItem('addedCoApplicant');
		}
	};

	return (
		response &&
		response.data && (
			<Wrapper>
				<Colom1>
					<Link to={`/product/${product}`}>
						<Head active={activeValue === '1'}>
							{response.data.name} <small>{response.data.description}</small>
						</Head>
					</Link>
					{response?.data?.product_details?.step?.map(m => (
						<>
							<Link to={`/product/${product}/${m.page}`} key={uuidv4()}>
								<Menu
									active={activeValue === m.page.toString()}
									completed={activeValue === (Number(m.page) + 1).toString()}
								>
									<div>{m.name}</div>
									{!!m.subStep && <CheckBox bg='white' checked round fg={'blue'} />}
								</Menu>
							</Link>
							{m.subStep && coApplicant && (
								<section className={`flex flex-col grid gap-y-5 py-2 px-10`}>
									{m.subStep.map(item => (
										<Link
											className={`${activeValue === `${subTypeData}/${item.page.toString()}` &&
												'border solid'} p-2 px-3 rounded`}
											to={`/product/${product}/${m.page}/co-applicants/${item.page}`}
										>
											{item.name}
										</Link>
									))}
								</section>
							)}
						</>
					))}
				</Colom1>
				<Colom2>
					<Suspense fallback={<Loading />}>
						<Switch>
							<Route
								exact
								path={`${path}`}
								component={() => <LoanDetails loanDetails={response.data.product_details} />}
							/>

							<Route
								path={`${path}/2`}
								component={() => (
									<IdentityVerification
										loanDetails={response.data.product_details}
										pageName={pageName}
									/>
								)}
							/>

							<Route
								path={`${path}/3`}
								component={() => <PersonalDetails data={response.data} pageName={pageName} />}
							/>

							<Route
								path={`${path}/6`}
								component={() => (
									<DocumentUpload
										loanDetails={response.data.product_details}
										footer={true}
										pageName={pageName}
										submitHandler={() => submitHandler()}
										submit={true}
									/>
								)}
							/>

							<Route
								path={`${path}/4`}
								exact
								component={() => (
									<AddressDetails
										coApplicant={coApplicant}
										click={() => subTypeHandler('co-applicants')}
										loanDetails={response.data.product_details}
										pageName={pageName}
										addedApplicant={addedApplicant}
									/>
								)}
							/>

							<Route
								path={`${path}/4/co-applicants/1`}
								component={() => (
									<SubType
										type='co-applicants'
										coApplicant={coApplicant}
										loanDetails={response.data.product_details.step}
										pageName={pageName}
										click={() => subTypeHandler('co-applicants')}
										cancel={true}
									/>
								)}
							/>

							<Route
								path={`${path}/4/co-applicants/2`}
								component={() => (
									<SubTypeIncome
										type='co-applicants'
										coApplicant={coApplicant}
										loanDetails={response.data.product_details.step}
										pageName={pageName}
										click={() => subTypeHandler('co-applicants')}
										cancel={true}
									/>
								)}
							/>

							<Route
								path={`${path}/4/co-applicants/3`}
								component={() => (
									<SubTypeDocs
										type='co-applicants'
										coApplicant={coApplicant}
										loanDetails={response.data.product_details.step}
										pageName={pageName}
										click={() => subTypeHandler('co-applicants')}
										cancel={true}
										submitHandler={() => submitHandler('co-applicants')}
										submit={true}
									/>
								)}
							/>

							<Route
								path={`${path}/5`}
								component={() => (
									<LoanDetailsComponent
										loanDetails={response.data.product_details}
										footer={true}
										pageName={pageName}
									/>
								)}
							/>

							<Route
								path={`${path}/7`}
								component={() => (
									<ApplicationSubmitted
										loanDetails={response.data.product_details}
										footer={true}
										pageName={pageName}
										click={() => subTypeHandler('gurantor')}
									/>
								)}
							/>
						</Switch>
					</Suspense>
				</Colom2>
			</Wrapper>
		)
	);
}

Product.propTypes = {
	product: string.isRequired
};
