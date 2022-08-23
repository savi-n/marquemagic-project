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

export default function Header({
	logo,
	openAccount,
	openAccountLink,
	logoLink,
}) {
	const [corporateName, setCorporateName] = useState('');
	const [backToDashboard, setBackToDashboard] = useState(false);

	const redirectDashboard = e => {
		e.preventDefault();
		const editLoan = JSON.parse(sessionStorage.getItem('editLoan'));
		if (editLoan?.loan_ref_id) {
			window.open(
				`${window.origin}/newui/main/loanlist?id=${editLoan?.loan_ref_id}`,
				'_self'
			);
		} else {
			window.open(`${window.origin}/newui/main/dashboard`, '_self');
		}
	};

	useEffect(() => {
		// + sign in the query string is URL-decoded to a space. %2B in the query string is URL-decoded to a + sign.
		// const params = queryString.parse(window.location.search);
		// if (params.cid || params.uid) {
		// 	getUserDetails(params);
		// }
		const userDetails = sessionStorage.getItem('userDetails');
		if (userDetails) setBackToDashboard(true);
		if (userDetails?.cacompname) setCorporateName(userDetails?.cacompname);
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
						<span>BACK TO DASHBOARD</span>
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
