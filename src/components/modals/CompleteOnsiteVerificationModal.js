import React from 'react';
import styled from 'styled-components';

import Button from '../Button';
import Modal from 'components/Modal';

const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100px;
	padding: 0 40px;
`;

const Text = styled.div`
	text-align: center;
	margin-bottom: 10px;
	font-size: 18px;
	font-weight: 500;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
	gap: 40px;
`;

const CompleteOnsiteVerificationModal = ({ onYes }) => {
	return (
		<Modal
			show={true}
			onClose={() => {}}
			width='30%'
			customStyle={{ minHeight: '200px' }}
		>
			<ModalBody>
				<Text
					style={{
						marginTop: '20px',
						fontSize: '15px',
						fontWeight: '600',
						textAlign: 'center',
					}}
				>
					Don't forget to click a selfie with your Applicant(s) at the
					Applicant's Location
				</Text>
			</ModalBody>
			<ModalFooter>
				<Button fill name='Sure' onClick={onYes} />
			</ModalFooter>
		</Modal>
	);
};

export default CompleteOnsiteVerificationModal;
