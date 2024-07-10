import React, { createContext, useEffect, useRef, useState } from 'react';
import Modal from '../Modal';
import styled from 'styled-components';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import errorIcon from 'assets/icons/Red_error_icon.png';

const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 200px;
	padding: 0 10px;
`;
const WarningWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
const SessionTimeOutText = styled.span`
	color: '#de524c';
	font-weight: 'bold';
	font-size: '20px';
`;

const BoldSpan = styled.span`
	font-weight: bold;
`;

const SessionTimeoutContext = createContext();

export const SessionTimeoutProvider = ({ children }) => {
	const timerRef = useRef(null);

	const [showModal, setShowModal] = useState(false);

	const callLogoutAPI = async token => {
		const d = await axios({
			method: 'post',
			url: `${API_END_POINT}/logout`,
			headers: { Authorization: `Bearer ${token}` },
		});
	};

	const handleBrowserTabChange = () => {
		if (document.hidden) {
			timerRef.current = setTimeout(() => {
				setShowModal(true);
			}, 300000);
		} else {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			if (showModal) {
				setTimeout(logout, 3000);
			}
		}
	};

	const logout = async () => {
		try {
			await callLogoutAPI(sessionStorage?.getItem('userToken'));
		} catch (error) {
			console.error('Error in logout', error);
		} finally {
			setShowModal(false);
			sessionStorage.clear();
			localStorage.clear();
			const currentDomain = window.origin;
			const loginRedirectUrl = `${currentDomain}/login`;
			window.open(loginRedirectUrl, '_self');
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', handleBrowserTabChange);
		return () => {
			document.removeEventListener('visibilitychange', handleBrowserTabChange);
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [showModal]);

	return (
		<SessionTimeoutContext.Provider value={{}}>
			{children}
			<Modal
				show={showModal}
				onClose={() => {
					console.log('Not Closable Modal');
				}}
				width='700px'
				customStyle={{ minHeight: '250px' }}
			>
				<WarningWrapper>
					<img
						src={errorIcon}
						alt='error-icon'
						style={{ height: '50px', width: '50px' }}
					/>
					<ModalBody>
						<span
							style={{ color: '#de524c', fontWeight: 'bold', fontSize: '20px' }}
						>
							Session Timed Out !
						</span>
						The session has timed out automatically,
						<BoldSpan>due to inactivity on the page.</BoldSpan>
						<br />
						<span>
							If not automatically redirected, Please login again using{' '}
							<BoldSpan>{`${window.origin}/login`}</BoldSpan>
						</span>
					</ModalBody>
				</WarningWrapper>
			</Modal>
		</SessionTimeoutContext.Provider>
	);
};
