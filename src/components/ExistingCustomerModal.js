/* A file contains modal that displays that this customer already has a relationship with us.
  User can select the customer id and proceed*/

import styled from 'styled-components';
import Modal from 'components/Modal';
import { useState } from 'react';
import Button from './Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import CustomerVerificationOTPModal from 'pages/products/CustomerVerificationOTPModal/CustomerVerificationOTPModal.js';
//src\pages\products\CustomerVerificationOTPModal\CustomerVerificationOTPModal.js
const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;
const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

const CustomerWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	border-radius: 14px;
	padding: 10px;
	background: #ffffff;
	box-shadow: 10px 10px 30px 3px rgba(11, 92, 255, 0.15);
	margin-bottom: 20px;
	margin-left: 30px;
	margin-right: 30px;
`;
const ModalHeader = styled.span`
	font-weight: 600;
	font-size: 30px;
	line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//marginBottom: '30px',
`;

const ModalSubHeader = styled.span`
	//font-weight: 600;
	font-size: 15px;
	//line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//margin-bottom: 30px;
`;

export default function ExistingCustomerModal({ show, onClose }) {
	const [
		isCustomerVerificationOTPModal,
		setCustomerVerificationOTPModal,
	] = useState(false);
	const customerList = [
		{
			Customer_Name: 'shubham',
			Customer_ID: 'id1',
			Mobile: 'mo-no1',
			Product: 'prod',
		},
		{
			Customer_Name: 'krishnan',
			Customer_ID: 'id2',
			Mobile: 'mo-no2',
			Product: 'prod',
		},
	];
	return (
		<>
			<Modal show={show} onClose={onClose} width='80%'>
				<ImgClose onClick={onClose} src={imgClose} alt='close' />
				<Wrapper>
					<ModalHeader>Dear Customer</ModalHeader>
					<ModalSubHeader>
						Looks like you already have existing relationship with us.
					</ModalSubHeader>
					<ModalSubHeader style={{ marginBottom: '30px' }}>
						Please select a customer ID to proceed with the application.
					</ModalSubHeader>

					{customerList.map((item, Index) => (
						<CustomerWrapper key={Index}>
							<div
								style={{
									flex: '1',
									padding: '10px',
									textAlign: 'center',
								}}
							>
								Customer Name: {item.Customer_Name}
							</div>
							<div
								style={{
									flex: '1',
									padding: '10px',
									textAlign: 'center',
								}}
							>
								Customer ID: {item.Customer_ID}
							</div>
							<div
								style={{
									flex: '1',
									padding: '10px',
									textAlign: 'center',
								}}
							>
								Mobile: {item.Mobile}
							</div>
							<div
								style={{
									flex: '1',
									padding: '10px',
									textAlign: 'center',
								}}
							>
								Product: {item.Product}
							</div>
						</CustomerWrapper>
					))}
					<Button
						name='Proceed'
						onClick={() => {
							show = false;
							setCustomerVerificationOTPModal(true);
						}}
						customStyle={{
							margin: '30px 40px 0 40px',
							alignSelf: 'flex-end',
						}}
						fill
					/>
				</Wrapper>
			</Modal>

			{isCustomerVerificationOTPModal && (
				<CustomerVerificationOTPModal
					isCustomerOtpModalOpen={isCustomerVerificationOTPModal}
					onClose={() => {
						setCustomerVerificationOTPModal(false);
						show = false;
					}}
				/>
			)}
		</>
	);
}
