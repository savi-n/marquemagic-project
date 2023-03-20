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

const ImageWrapper = styled.div`
	flex-direction: column;
	display: flex;
	align-items: center;
`;

const ErrorImage = styled.img`
	width: 100px;
`;

const MandatoryOnsiteVerificationErrModal = ({
	onYes,
	errorImage,
	errorText,
}) => {
	return (
		<Modal
			show={true}
			onClose={() => {}}
			width='30%'
			customStyle={{ minHeight: '200px' }}
		>
			<ImageWrapper>
				{errorImage ? <ErrorImage alt='error' src={errorImage} /> : null}
			</ImageWrapper>
			<ModalBody>
				<Text>
					{errorText ? errorText : 'On-site Verification Not Completed'}
				</Text>
			</ModalBody>

			<ModalFooter>
				<Button fill name='Complete Now' onClick={onYes} />
			</ModalFooter>
		</Modal>
	);
};

export default MandatoryOnsiteVerificationErrModal;
