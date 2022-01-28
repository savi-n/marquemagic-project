import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { string } from 'prop-types';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import { decryptMsg, decryptRes } from 'utils/encrypt';

const Div = styled.div`
	margin-left: auto;
`;

const Logo = styled.img`
	width: 200px;
	height: calc(100% - 40px);
	object-fit: scale-down;
	object-position: left;
`;

export default function Header({
	logo,
	openAccount,
	openAccountLink,
	logoLink,
}) {
	const [corporateName, setCorporateName] = useState('');

	const getUserDetails = async cid => {
		try {
			// const userRes.data.data.cacompname || "" = await axios.get(`${API_END_POINT}/userDetails?userid=10987`);
			// http://3.108.54.252:1337/usersDetails?userid=10987
			// console.log('CID-before-replace-', cid);
			cid = cid.replaceAll(' ', '+');
			// console.log('CID-before-', cid);
			const newCID = decryptRes(cid);
			// console.log('CID-after-', newCID);
			const userRes = await axios.get(
				`${API_END_POINT}/usersDetails?userid=${newCID}`
			);
			const corporateDetails = userRes?.data?.data;
			// console.log('userres-data-', corporateDetails?.cacompname || '');
			setCorporateName(corporateDetails?.cacompname || '');
			localStorage.setItem(
				'corporateDetails',
				JSON.stringify(corporateDetails)
			);
		} catch (error) {
			console.log('error-getUserDetails-', error);
		}
	};

	useEffect(() => {
		// + sign in the query string is URL-decoded to a space. %2B in the query string is URL-decoded to a + sign.
		const params = queryString.parse(window.location.search);
		if (params.cid) {
			getUserDetails(params.cid);
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
