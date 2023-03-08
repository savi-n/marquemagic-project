import React from 'react';
import Button from '../Button';
import Modal from 'components/Modal';
import styled from 'styled-components';
import closeIcon from 'assets/icons/close_icon_grey-05.svg';

const Close = styled.img`
	float: right;
	width: 25px;
	cursor: pointer;
`;

const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 250px;
	padding: 0 20px;
	font-weight: bold;
	text-align: center;
	font-size: 20px;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
	gap: 40px;
`;

function SelfieAlertModal(props) {
	const { show, onClose } = props;
	return (
		<Modal
			show={show}
			onClose={() => onClose(false)}
			customStyle={{
				maxWidth: '30%',
			}}
		>
			<Close src={closeIcon} onClick={() => onClose(false)} alt='close-icon' />
			<ModalBody>
				Don't forget to click a selfie with your Applicant at the Applicant's
				Location
			</ModalBody>
			<ModalFooter>
				<Button name='Sure' fill onClick={() => onClose(false)} />
			</ModalFooter>
		</Modal>
	);
}

export default SelfieAlertModal;
