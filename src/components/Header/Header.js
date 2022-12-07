/* Header section for the application */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';
import * as UI from './ui';

// const Div = styled.div`
// 	margin-left: auto;
// `;

const Logo = styled.img`
	width: 200px;
	height: calc(100% - 40px);
	object-fit: scale-down;
	object-position: left;
	@media (max-width: 700px) {
		padding: 0px 50px;
		width: 100%;
	}
`;

const Header = props => {
	const { logo, openAccount, openAccountLink, logoLink } = props;
	const { app, application } = useSelector(state => state);
	const { userToken: reduxUserToken } = app;
	const { loanRefId: reduxLoanRefId } = application;
	const [corporateName, setCorporateName] = useState('');
	const [backToDashboard, setBackToDashboard] = useState(false);
	const [loanRefId, setLoanRefId] = useState('');

	useEffect(() => {
		if (reduxUserToken) {
			setBackToDashboard(true);
			if (!reduxLoanRefId) return;
			setLoanRefId(reduxLoanRefId);
		}
	}, [reduxLoanRefId, reduxUserToken]);

	const redirectDashboard = e => {
		e.preventDefault();
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
		<>
			<UI.LogoLink
				href={logoLink ? logoLink : '/'}
				{...logoLink && { target: '_blank' }}
			>
				<Logo src={logo} alt='logo' />
			</UI.LogoLink>
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
		</>
	);
};

export default Header;
