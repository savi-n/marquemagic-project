import React from 'react';

import Modal from 'components/Modal';

import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI from './ui';

const BiometricModal = props => {
	const { show, onClose, biometricRes } = props;

	return (
		<Modal
			show={show}
			onClose={onClose}
			width='90%'
			height='90%'
			customStyle={{
				padding: '40px',
			}}
		>
			<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
			<UI.ResponsiveWrapper>
				<div dangerouslySetInnerHTML={{ __html: biometricRes?.data }} />
			</UI.ResponsiveWrapper>
		</Modal>
	);
};

export default BiometricModal;
