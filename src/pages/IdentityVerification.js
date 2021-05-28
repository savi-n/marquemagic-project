import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Input from '../shared/components/Input/index';
import Button from '../shared/components/Button/index';
import OtpModal from '../components/otpModal';
import Layout from '../Layout';
import { generateOtp } from '../utils/requests';
import ModalRenders from '../components/ModalRenders';

const Colom1 = styled.div`
	flex: 1;
	background: ${({ theme }) => theme.themeColor1};
`;

const Colom2 = styled.div`
	width: 100%;
	background: ${({ theme }) => theme.themeColor1};
`;

const Img = styled.img`
	width: 100%;
	height: calc(100vh - 80px);
	object-fit: cover;
	object-position: center;
`;

export default function IdentityVerification({ loanDetails, pageName }) {
	const [contact, setContact] = useState('');
	const [userId, setUserId] = useState('');
	const [status, setStatus] = useState('');
	const [bankStatus, setBankStatus] = useState('');
	const [custID, setCustID] = useState('');
	const [show, setShow] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [selectedAccount, setSelectedAccount] = useState(null);

	const handleSubmit = async () => {
		setBankStatus(null);
		if (!contact && !custID) {
			console.log('error');
			setContact('');
			setCustID('');
			return;
		} else if (contact && custID) {
			setContact('');
			setCustID('');
			alert('please enter one of both');
			return;
		}

		const data = await generateOtp(contact, custID);
		if (data.statusCode === 'NC500') {
			setErrorMessage(data.message);
		}
		console.log(Boolean(data.mobileNo));
		if (!data.mobileNo) {
			setErrorMessage('We cannot find any mobile number associated with the given customer ID.');
			return;
		}
		if (!data) {
			setBankStatus(null);
			setErrorMessage('Invalid Data Given');
		}
		setContact(data.mobileNo);
		setCustID(data.customerId);
		setBankStatus(data.statusCode);
		setUserId(data.userId);
		setShow(true);
	};

	const link = 'https://media-public.canva.com/uClYs/MAED4-uClYs/1/s.svg';

	const toggle = () => {
		setContact('');
		setCustID('');
		setBankStatus('');
		setStatus('');
		localStorage.removeItem('selectedAccount');
		setShow(!show);
	};

	return (
		loanDetails && (
			<>
				<Layout>
					<section className='w-1/2'>
						<h1 className='text-lg sm:text-xl text-black'>
							Help us with your <span className='text-blue-600'>{pageName}</span>
						</h1>
						<section className='flex gap-y-4 flex-col text-center py-16'>
							<Input
								placeholder='Enter Mobile Number'
								sideHead='Or'
								onChange={e => setContact(e.target.value)}
								p='5'
							/>
							<Input
								placeholder='Enter Customer ID'
								link={{ to: '#', name: 'verify' }}
								linkColor='pink'
								onChange={e => setCustID(e.target.value)}
								p='5'
							/>
						</section>
						<Button onClick={handleSubmit} type='blue'>
							Login
						</Button>
					</section>
				</Layout>
				<section className='w-1/4 absolute right-0'>
					<img
						style={{ height: 'calc(100vh - 80px)' }}
						className='w-full'
						src={loanDetails.imageUrl}
						alt='Loan Caption'
					/>
				</section>
				{bankStatus === 'NC200' && (
					<OtpModal
						setBankStatus={setBankStatus}
						setStatus={setStatus}
						setUserId={setUserId}
						toggle={toggle}
						show={show}
						mobileNo={contact}
						customerId={custID}
						userId={userId}
						status={status}
						setSelectedAccount={setSelectedAccount}
						selectedAccount={selectedAccount}
					/>
				)}
				{(!bankStatus || bankStatus === 'NC500') && (
					<ModalRenders show={show} toggle={toggle} link={link} message={errorMessage} />
				)}
			</>
		)
	);
}
