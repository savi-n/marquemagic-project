/* Header section for the application */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { string } from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';

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

export default function Header(props) {
	const { logo, openAccount, openAccountLink, logoLink } = props;
	const [corporateName, setCorporateName] = useState('');
	const [backToDashboard, setBackToDashboard] = useState(false);
	const [loanRefId, setLoanRefId] = useState('');

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
			<a href={logoLink ? logoLink : '/'} {...logoLink && { target: '_blank' }}>
				<Logo src={logo} alt='logo' />
			</a>
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
				<div className='px-5' style={{ marginLeft: 'auto' }}>
					<Button onClick={redirectDashboard}>
						<span>
							{loanRefId ? 'BACK TO LOAN LISTING' : 'BACK TO DASHBOARD'}
						</span>
					</Button>
				</div>
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
}

Header.propTypes = {
	logo: string.isRequired,
};
