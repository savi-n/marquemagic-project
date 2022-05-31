/* Header section for the application */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { string } from 'prop-types';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/Button';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import { decryptRes } from 'utils/encrypt';

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
		window.open(`${window.origin}/newui/main/dashboard`, '_self');
	};

	const getUserDetails = async params => {
		try {
			// const userRes.data.data.cacompname || "" = await axios.get(`${API_END_POINT}/userDetails?userid=10987`);
			// http://3.108.54.252:1337/usersDetails?userid=10987
			// console.log('CID-before-replace-', cid);
			let UID = params.cid || params.uid;
			UID = UID.replaceAll(' ', '+');
			// console.log('UID-before-', UID);
			const newUID = decryptRes(UID);
			// const newUID = decryptUID(UID.toString());
			// console.log('UID-after-', newUID);
			const userRes = await axios.get(
				`${API_END_POINT}/usersDetails?userid=${newUID}`
				// console.log('header-userRes', userRes);
			);
			const userDetails = userRes?.data?.data;
			// console.log('userres-data-', userDetails?.cacompname || '');
			const stringifyUserDetails = JSON.stringify(userDetails);
			if (params.cid) {
				setCorporateName(userDetails?.cacompname || '');
				sessionStorage.setItem('corporateDetails', stringifyUserDetails);
			} else if (params.uid) {
				// console.log('uid-passed-', { params, stringifyUserDetails });
				sessionStorage.setItem('userDetails', stringifyUserDetails);
				setBackToDashboard(true);
			}
		} catch (error) {
			// console.log('error-Header-getUserDetails-', error);
		}
	};

	useEffect(() => {
		// + sign in the query string is URL-decoded to a space. %2B in the query string is URL-decoded to a + sign.
		const params = queryString.parse(window.location.search);
		if (params.cid || params.uid) {
			getUserDetails(params);
		}
		if (sessionStorage.getItem('userDetails')) {
			setBackToDashboard(true);
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
					}}>
					{corporateName}
				</div>
			)}
			{backToDashboard && (
				<div className='px-5' style={{ marginLeft: '51em' }}>
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
