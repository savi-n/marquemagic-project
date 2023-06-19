/* A file contains modal that displays that this customer already has a relationship with us.
  User can select the customer id and proceed*/
import Button from 'components/Button';
import Modal from 'components/Modal';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI from './ui';

export default function CustomerListModal(props) {
	const {
		show,
		onClose,
		customerList,
		selectedCustomer,
		setSelectedCustomer,
		onProceedSelectCustomer,
		sendingOTP,
	} = props;

	// console.log('CustomerListModal-allstates-', { props });

	return (
		<Modal
			show={show}
			onClose={onClose}
			width='80%'
			height='70%'
			customStyle={{
				padding: '40px',
			}}
		>
			<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
			<UI.CustomerListWrapper>
				<UI.CustomerListModalHeader>Dear Customer</UI.CustomerListModalHeader>
				<UI.CustomerListModalSubHeader>
					Looks like you already have existing relationship with us.
				</UI.CustomerListModalSubHeader>
				<UI.CustomerListModalSubHeader style={{ marginBottom: '30px' }}>
					Please select a customer ID to proceed with the application.
				</UI.CustomerListModalSubHeader>
				{customerList?.map((customer, customerIndex) => (
					<UI.CustomerListCard
						key={`data-${customerIndex}`}
						onClick={() => {
							setSelectedCustomer(customer);
						}}
						isActive={!!selectedCustomer}
					>
						<UI.CustomerListCardItem>
							Customer Name: {customer?.customer_name}
						</UI.CustomerListCardItem>
						<UI.CustomerListCardItem>
							Customer ID: {customer?.customer_id}
						</UI.CustomerListCardItem>
						<UI.CustomerListCardItem>
							Mobile: {customer?.mobile_flag}
						</UI.CustomerListCardItem>
						<UI.CustomerListCardItem>
							Product: LAP (mapping pending)
						</UI.CustomerListCardItem>
					</UI.CustomerListCard>
				))}
				<UI.CustomerDetailsFormModalFooter>
					<Button
						disabled={!selectedCustomer || sendingOTP}
						isLoader={sendingOTP}
						name='Proceed'
						onClick={onProceedSelectCustomer}
						fill
					/>
				</UI.CustomerDetailsFormModalFooter>
			</UI.CustomerListWrapper>
		</Modal>
	);
}
