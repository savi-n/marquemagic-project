/* A file contains modal that displays that this customer already has a relationship with us.
  User can select the customer id and proceed*/

import styled from 'styled-components';
import Modal from 'components/Modal';
import { useState } from 'react';
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
					<span
						style={{
							fontWeight: '600',
							fontSize: '30px',
							lineHeight: '54px',
							textAlign: 'center',
							display: 'flex',
							justifyContent: 'center',
							color: '#4E4E4E',
							//marginBottom: '30px',
						}}
					>
						Dear Customer
					</span>
					<span
						style={{
							font: '15px Arial, sans-serif',
							display: 'flex',
							justifyContent: 'center',
							textAlign: 'center',
							color: '#4E4E4E',
							//marginBottom: '30px',
							//width: '60%',
						}}
					>
						Looks like you already have existing relationship with us.
					</span>
					<span
						style={{
							font: '15px Arial, sans-serif',
							display: 'flex',
							justifyContent: 'center',
							textAlign: 'center',
							color: '#4E4E4E',
							marginBottom: '30px',
							//width: '60%',
						}}
					>
						Please select a customer ID to proceed with the application.
					</span>

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
					<button
						style={{
							padding: '16px 64px',
							backgroundColor: ' #2A2ADD',
							color: '#fff',
							border: 'none',
							borderRadius: '35px',
							cursor: 'pointer',
							alignSelf: 'flex-end',
							margin: '25px 0px',
						}}
						type='Proceed'
						onClick={() => {
							setCustomerVerificationOTPModal(true);

							show = false;
						}}
					>
						Proceed
					</button>
				</Wrapper>
			</Modal>

			{isCustomerVerificationOTPModal && (
				<CustomerVerificationOTPModal
					isCustomerOtpModalOpen={isCustomerVerificationOTPModal}
					onClose={() => {
						setCustomerVerificationOTPModal(false);
					}}
					width='80%'
				/>
			)}
		</>
	);
}
