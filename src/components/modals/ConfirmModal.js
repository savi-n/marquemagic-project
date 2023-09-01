/* Confirm popup/modal is used when we select the Business type or Income type.
 This tells user that type cannot be changed later  in the application*/

import React from 'react';
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

const ConfirmModal = props => {
	const { show, onClose, ButtonProceed, type = 'income' } = props;
	return (
		<Modal
			show={show}
			onClose={() => onClose(false)}
			width='30%'
			customStyle={{ minHeight: '200px' }}
		>
			<ModalBody>
				Please check the {type} selected. {type} can't be changed later
			</ModalBody>
			<ModalFooter>
				<Button name='Close' onClick={() => onClose(false)} />
				{ButtonProceed}
			</ModalFooter>
		</Modal>
	);
};

export default ConfirmModal;
