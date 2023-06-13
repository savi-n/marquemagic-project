/* A file contains modal that displays that this customer already has a relationship with us.
  User can select the customer id and proceed*/
import Modal from 'components/Modal';
import CustomerVerificationOTPModal from 'components/ProductCard/CustomerVerificationOTPModal';

import { useState } from 'react';
import Button from '../Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI from './ui';

export default function CustomerListModal(props) {
	const {
		isCustomerListModalOpen,
		setCustomerListModalOpen,
		customerList,
	} = props;
	const [
		isCustomerVerificationOTPModal,
		setCustomerVerificationOTPModal,
	] = useState(false);

	return (
		<>
			<Modal
				show={isCustomerListModalOpen}
				onClose={() => setCustomerListModalOpen(false)}
				width='80%'
			>
				<UI.ImgClose
					onClick={() => setCustomerListModalOpen(false)}
					src={imgClose}
					alt='close'
				/>
				<UI.CustomerListWrapper>
					<UI.ModalHeader>Dear Customer</UI.ModalHeader>
					<UI.ModalSubHeader>
						Looks like you already have existing relationship with us.
					</UI.ModalSubHeader>
					<UI.ModalSubHeader style={{ marginBottom: '30px' }}>
						Please select a customer ID to proceed with the application.
					</UI.ModalSubHeader>
					{customerList.map((item, customerIndex) => (
						<UI.CustomerListCard key={`data-${customerIndex}`}>
							<UI.CustomerListCardItem>
								Customer Name: {item.customer_name}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								Customer ID: {item.customer_id}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								Mobile: {item.mobile_flag}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								Product: LAP (mapping pending)
							</UI.CustomerListCardItem>
						</UI.CustomerListCard>
					))}
					<Button
						name='Proceed'
						onClick={() => {
							setCustomerVerificationOTPModal(true);
						}}
						customStyle={{
							margin: '30px 40px 0 40px',
							alignSelf: 'flex-end',
						}}
						fill
					/>
				</UI.CustomerListWrapper>
			</Modal>

			{isCustomerVerificationOTPModal && (
				<CustomerVerificationOTPModal
					isCustomerOtpModalOpen={isCustomerVerificationOTPModal}
					onClose={() => {
						setCustomerVerificationOTPModal(false);
						setCustomerListModalOpen(false);
					}}
				/>
			)}
		</>
	);
}
