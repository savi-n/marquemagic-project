import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Input from '../shared/components/Input/index';
import Button from '../shared/components/Button/index';
import OtpModal from '../components/otpModal';

const Colom1 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
	padding: 50px;
`;

const Colom2 = styled.div`
	width: 40%;
	background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const Heading = styled.h1`
	font-size: 1.5rem;
	color: black;
`;

export default function IdentityVerification({ loanDetails, pageName }) {
	const [contact, setContact] = useState('');
	const [custID, setCustID] = useState('');
	const [show, setShow] = useState(false);

	const handleSubmit = async () => {
		toggle();
		if (!contact && !custID) {
			console.log('error');
			return;
		}
	};

	const toggle = () => setShow(!show);

	return (
		loanDetails && (
			<>
				<Colom1>
					<Heading>
						Help us with your <span className='text-blue-600'>{pageName}</span>
					</Heading>
					<section className='flex flex-col w-1/2 text-center py-16'>
						<Input placeholder='Enter Mobile Number' onChange={e => setContact(e.target.value)} />
						<span style={{ margin: '1rem' }}>
							<b>OR</b>
						</span>
						<Input
							placeholder='Enter Customer ID'
							link={{ to: '#', name: 'verify' }}
							linkColor='pink'
							onChange={e => setCustID(e.target.value)}
						/>
					</section>
					<Button onClick={handleSubmit} type='blue-light'>
						Login
					</Button>
				</Colom1>
				<Colom2>
					<Img src={loanDetails.imageUrl} alt={'Loan Caption'} />
				</Colom2>
				<OtpModal toggle={toggle} show={show} />
			</>
		)
	);
}
