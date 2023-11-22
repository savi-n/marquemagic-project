import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';

const ModalBody = styled.div`
	/* display: flex;
	flex-direction: column; */
	/* align-items: center; */
	/* justify-content: center; */
	/* height: 100px; */
	padding: 0 40px;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
	gap: 40px;
`;

const DataDeletionWarningModal = props => {
	const { warningMessage, show, onClose, onProceed } = props;
	return (
		<Modal
			show={show}
			onClose={() => onClose(false)}
			width='30%'
			customStyle={{
				minHeight: 'fit-content',
				display: 'flex',
				gap: '20px',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<ModalBody>{warningMessage}</ModalBody>
			<ModalFooter>
				<Button name='Cancel' onClick={() => onClose(false)} />
				<Button name='Proceed' fill onClick={() => onProceed()} />
			</ModalFooter>
		</Modal>
	);
};

export default DataDeletionWarningModal;
