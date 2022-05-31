/* Confirm popup/modal is used when we select the Business type or Income type.
 This tells user that type cannot be changed later  in the application*/

import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';

const ModalBody = styled.div`
	padding: 40px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	margin: auto;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	gap: 50px;
	margin-bottom: 10px;
`;

const ConfirmModal = props => {
	const { show, onClose, ButtonProceed, type = 'income' } = props;
	return (
		<Modal show={show} onClose={() => onClose(false)} width='30%'>
			<ModalBody>
				Please check the {type} Type selected. {type} Type can't be changed
				later
			</ModalBody>
			<ModalFooter>
				<Button name='Close' onClick={() => onClose(false)} />
				{ButtonProceed}
			</ModalFooter>
		</Modal>
	);
};

export default ConfirmModal;
