import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { useState } from 'react';
import * as UI from 'pages/product/panverification/ui';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import GreenTick from 'assets/images/hint/success_icon.png';
import RedTick from 'assets/images/hint/wrong-icon.png';
import PortraitRight from 'assets/images/hint/Portrait_hint_right.png';
import PortraitWrong from 'assets/images/hint/Portrait_hint_wrong.png';
import Info from 'assets/images/hint/info_icon.png';
import Button from './Button';
const HintText = styled.div`
	/* color: #8ec5f3; */
	color: #007cff;
	cursor: default;
	display: flex;
	margin-bottom: 2px;
	@media (max-width: 768px) {
		display: block;
	}
`;
const InfoIcon = styled.img`
	width: 20px;
	height: 18px;
	margin: 0 2px 0 2px;
	cursor: pointer;
`;

const HintIcon = styled.div`
	/* color: #b9b9b9; */
	color: #696969;
	background-color: #ddddde;
	border-radius: 30px;
	padding: 5px 3px 3px 3px;
	display: flex;
	margin-left: 5px;
	font-size: small;
	@media (max-width: 768px) {
		display: flex;
		width: 50%;
		margin-top: 10px;
		padding: 6px 6px 6px 6px;
	}
`;
const HintIconBadge = styled.div`
	cursor: pointer;
`;
const ModalTitle = styled.div`
	text-align: center;
	font-size: large;
	font-weight: bold;
`;
const HintImages = styled.img`
	height: auto;
	display: block;
`;
const ModalBody = styled.div`
	display: flex;
	margin: 20px 0 20px 0;
	justify-content: center;
	gap: 140px;
	@media (max-width: 768px) {
		gap: 130px;
	}
`;
const ModalImages = styled.div`
	display: flex;
	margin: 20px 0 20px 0;
	justify-content: center;
	gap: 50px;
`;
const ButtonWrapper = styled.div`
	text-align: center;
	margin: 40px 0 20px 0;
`;

function Hint(props) {
	const { hint, hintIconName } = props;
	const [show, setShow] = useState(false);
	return (
		<HintText>
			{hint}
			<HintIcon
				onClick={() => {
					setShow(true);
				}}
			>
				<HintIconBadge>
					<Modal
						show={show}
						onClose={() => {
							setShow(false);
						}}
						width='40%'
					>
						<section className='p-4 flex flex-col gap-y-8'>
							<UI.ImgClose
								onClick={() => {
									setShow(false);
								}}
								src={imgClose}
								alt='close'
							/>
						</section>
						<ModalTitle>
							Please upload your document in Portrait Mode.
						</ModalTitle>
						<ModalBody>
							<HintImages style={{ width: 30 }} src={GreenTick} />
							<HintImages style={{ width: 30 }} src={RedTick} />
						</ModalBody>
						<ModalImages>
							<HintImages style={{ width: 120 }} src={PortraitRight} />
							<HintImages style={{ width: 120 }} src={PortraitWrong} />
						</ModalImages>
						<ButtonWrapper>
							<Button
								customStyle={{
									color: '#fff',
									background: '#1414ad',
									left: '50%',
									minWidth: '200px',
									borderRadius: '30px',
								}}
								onClick={() => {
									setShow(false);
								}}
							>
								Done
							</Button>
						</ButtonWrapper>
					</Modal>
				</HintIconBadge>
				<InfoIcon src={Info} />
				{hintIconName}
			</HintIcon>
		</HintText>
	);
}

export default Hint;
