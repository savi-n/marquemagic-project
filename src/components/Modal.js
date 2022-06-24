/* A generic modal is created here which is used to create other Modals like AadharModal */

import { createPortal } from 'react-dom';
import { bool } from 'prop-types';
import styled from 'styled-components';

const Backdrop = styled.div`
	position: fixed;
	height: 100vh;
	width: 100vw;
	background: rgba(0, 0, 0, 0.5);
	top: 0;
	left: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
`;
const ModalClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
const Modalbody = styled.div`
	background: #fff;
	padding: 20px;
	border-radius: 15px;
	max-width: 50%;
	min-width: ${({ width }) => width};
	min-height: 50%;
	max-height: 70%;
	overflow: auto;
	box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
	@media (max-width: 700px) {
		min-width: 100%;
	}
`;

export default function Modal({
	show,
	backdrop,
	bg,
	children,
	width,
	onClose = () => {
		console.log('close');
	},
	customStyle,
}) {
	const root = document.body;
	if (!show) return null;
	return createPortal(
		<>
			<Backdrop backdrop={backdrop} onClick={onClose}>
				<Modalbody
					style={customStyle ? customStyle : {}}
					width={width}
					onClick={e => {
						e.stopPropagation();
					}}>
					{children}
				</Modalbody>
			</Backdrop>
			,
		</>,
		root
	);
}

Modal.defaultProps = {
	show: false,
	backdrop: true,
};

Modal.propTypes = {
	show: bool,
	// backdrop: oneOf([bool, number])
};
