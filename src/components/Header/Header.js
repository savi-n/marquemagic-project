/* Header section for the application */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import queryString from 'query-string';

import Button from 'components/Button';

import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { setCompletedDirectorSection } from 'store/directorsSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import * as UI from './ui';

// const Div = styled.div`
// 	margin-left: auto;
// `;

const Header = props => {
	const { logo, openAccount, openAccountLink, logoLink } = props;
	const { app, application } = useSelector(state => state);
	const {
		userToken: reduxUserToken,
		isLocalhost,
		isTestMode,
		isViewLoan,
		selectedSectionId,
		directorSectionIds,
		nextSectionId,
	} = app;
	const { loanRefId: reduxLoanRefId } = application;
	const [corporateName, setCorporateName] = useState('');
	const [backToDashboard, setBackToDashboard] = useState(false);
	const [loanRefId, setLoanRefId] = useState('');
	const dispatch = useDispatch();

	useEffect(() => {
		const params = queryString.parse(window.location.search);
		if (params.token) {
			if (reduxUserToken) {
				setBackToDashboard(true);
				if (!reduxLoanRefId) return;
				setLoanRefId(reduxLoanRefId);
			}
		}
	}, [reduxLoanRefId, reduxUserToken]);

	const redirectDashboard = e => {
		e.preventDefault();
		sessionStorage.clear();
		if (loanRefId) {
			window.open(
				`${window.origin}/newui/main/loanlist?id=${loanRefId}`,
				'_self'
			);
		} else {
			window.open(`${window.origin}/newui/main/dashboard`, '_self');
		}
	};

	// console.log('header-usereffecto-', {
	// 	reduxLoanRefId,
	// 	reduxUserToken,
	// });

	useEffect(() => {
		try {
			const userDetails = sessionStorage.getItem('userDetails');
			const editLoan = sessionStorage.getItem('editLoan');
			if (editLoan) {
				setLoanRefId(JSON.parse(editLoan)?.loan_ref_id || '');
			}
			if (userDetails || editLoan) setBackToDashboard(true);
			if (userDetails) {
				setCorporateName(JSON.parse(userDetails)?.cacompname);
			}
		} catch (error) {
			console.error('error-Header-useEffect-', error);
		}
	}, []);

	return (
		<UI.Wrapper>
			<UI.LogoLink
				backToDashboard={backToDashboard}
				href={logoLink ? logoLink : '/'}
				{...logoLink && { target: '_blank' }}
			>
				<UI.Logo src={logo} alt='logo' />
			</UI.LogoLink>
			{isLocalhost && !isViewLoan && (
				<div
					style={{
						width: '100%',
						textAlign: 'center',
					}}
				>
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
					{!['basic_details', 'business_details'].includes(
						selectedSectionId
					) && (
						<Button
							customStyle={{ marginLeft: 20 }}
							name='Skip'
							onClick={() => {
								console.log('header-onskip-', {
									directorSectionIds,
									selectedSectionId,
								});
								if (directorSectionIds?.includes(selectedSectionId)) {
									dispatch(setCompletedDirectorSection(selectedSectionId));
								} else {
									dispatch(setCompletedApplicationSection(selectedSectionId));
								}
								dispatch(setSelectedSectionId(nextSectionId));
							}}
						/>
					)}
				</div>
			)}
			{corporateName && (
				<div
					style={{
						width: '100%',
						textAlign: 'center',
						fontWeight: 'bold',
						fontSize: '24px',
						color: '#525252',
					}}
				>
					{corporateName}
				</div>
			)}
			{backToDashboard && (
				<UI.ButtonBackToDashboardWrapper>
					<Button onClick={redirectDashboard} customStyle={{ width: 'auto' }}>
						<span>
							{loanRefId ? 'BACK TO LOAN LISTING' : 'BACK TO DASHBOARD'}
						</span>
					</Button>
				</UI.ButtonBackToDashboardWrapper>
			)}
			{openAccount && (
				<div className='ml-auto'>
					<Button onClick={() => window.open(openAccountLink, '_blank')}>
						<span className='px-4'>Open Account</span>
						<FontAwesomeIcon icon={faChevronRight} size='1x' />
					</Button>
				</div>
			)}
		</UI.Wrapper>
	);
};

export default Header;
