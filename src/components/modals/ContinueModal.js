import styled from 'styled-components';

import Button from '../Button';
import Modal from '../Modal';

const Text = styled.div`
	text-align: center;
	margin-bottom: 10px;
	font-size: 18px;
	font-weight: 500;
`;

const BtnWrap = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 40%;
	margin: 20px 0;
	@media (max-width: 700px) {
		width: 60%;
	}
`;

const ModalBody = styled.div`
	height: 100%;
	padding: 80px 40px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	margin: auto;
`;

export default function ContinueModal({ onYes, onNo }) {
	return (
		<Modal show={true} onClose={() => {}} width='30%'>
			<ModalBody>
				<Text>Do you Want to continue with the pending application?</Text>
				{/* <small>
					Note: Any document uploaded needs to be re-uploaded for the loan
					application
				</small> */}
				<BtnWrap className='gap-x-4'>
					<Button width='auto' fill name='Yes' onClick={onYes} />

					<Button width='auto' fill name='No' onClick={onNo} />
				</BtnWrap>
			</ModalBody>
		</Modal>
	);
}
