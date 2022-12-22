import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';

const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100px;
	padding: 0 40px;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
	gap: 40px;
`;

const SessionExpired = props => {
	const { show } = props;
	const [timer, setTimer] = useState(5);

	useEffect(() => {
		const loginTimer = setInterval(() => {
			setTimer(prevTimer => prevTimer - 1);
		}, 1000);
		return () => clearInterval(loginTimer);
	}, []);

	useEffect(() => {
		if (timer === 0) {
			window.open('/', '_self');
		}
	}, [timer]);

	return (
		<Modal show={show} width='30%' customStyle={{ minHeight: '200px' }}>
			<ModalBody>
				<h4>Your session has expired, Please login again</h4>
				<br />
				<small>
					You'll be Auto redirect to login page in {timer > -1 ? timer : 0}
				</small>
			</ModalBody>
			<ModalFooter>
				<Button fill name='Login' onClick={() => window.open('/', '_self')} />
			</ModalFooter>
		</Modal>
	);
};

export default SessionExpired;
