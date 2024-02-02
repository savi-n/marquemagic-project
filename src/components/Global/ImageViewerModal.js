/* Confirm popup/modal is used when we select the Business type or Income type.
 This tells user that type cannot be changed later  in the application*/

import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import imgClose from 'assets/icons/close_icon_grey-06.svg';

const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: fit-content;
`;

const ImgClose = styled.img`
	height: 25px;
	margin: 1rem;
	cursor: pointer;
	margin-left: auto;
`;

const ImageViewerModal = props => {
	const { modalVisible, imageSrc, onClose } = props;

	return (
		<Modal
			show={modalVisible}
			onClose={() => onClose()}
			width={'60%'}
			customStyle={{ minHeight: '200px' }}
		>
			<section>
				<ImgClose
					onClick={() => {
						onClose();
					}}
					src={imgClose}
					alt='close'
				/>
				<ModalBody>
					<img
						src={imageSrc}
						alt={'modal'}
						style={{ maxWidth: '100%', maxHeight: '100%' }}
						onClick={e => e.preventDefault()}
						onContextMenu={e => e.preventDefault()} // Prevents right-click context menu
						onMouseDown={e => e.preventDefault()} // Prevents any mouse button down events
					/>
				</ModalBody>
			</section>
		</Modal>
	);
};

export default ImageViewerModal;
