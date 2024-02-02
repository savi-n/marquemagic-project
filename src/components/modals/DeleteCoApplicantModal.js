/* If the user refreshes the page, he/she will see a popup/modal
that asks if user wants to continue the application creation
from where he had left or start from the beginning*/

import styled from 'styled-components';

import Button from '../Button';
import Modal from 'components/Modal';

const Text = styled.div`
	text-align: center;
	margin-bottom: 10px;
	font-size: 18px;
	font-weight: 500;
`;

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

export default function DeleteCoApplicantModal({ onYes, onNo, label = '' }) {
	return (
		<Modal
			show={true}
			onClose={() => {}}
			width='30%'
			customStyle={{ minHeight: '200px' }}
		>
			<ModalBody>
				<Text>Are you sure you want to delete the {label}?</Text>
				<Text>You will loose all the entered details</Text>
			</ModalBody>
			<ModalFooter>
				<Button fill name='Yes' onClick={onYes} />
				<Button name='No' onClick={onNo} />
			</ModalFooter>
		</Modal>
	);
}
