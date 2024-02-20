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

	// console.log('CustomerListModal-allstates-', { customerList });
	return (
		<>
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
					{setSelectedCustomer && (
						<>
							<UI.CustomerListModalHeader>
								Dear Customer
							</UI.CustomerListModalHeader>
							<UI.CustomerListModalSubHeader>
								Looks like you already have existing relationship with us.
							</UI.CustomerListModalSubHeader>
							<UI.CustomerListModalSubHeader style={{ marginBottom: '30px' }}>
								Please select a customer ID to proceed with the application.
							</UI.CustomerListModalSubHeader>
						</>
					)}
					{customerList?.map((customer, customerIndex) => (
						<UI.CustomerListCard
							key={`data-${customerIndex}`}
							onClick={() => {
								setSelectedCustomer && setSelectedCustomer(customer);
							}}
							isActive={
								customer?.customer_id === selectedCustomer?.customer_id
									? true
									: false
							}
						>
							<UI.CustomerListCardItem>
								Customer Name: {customer?.customer_name || customer?.V_CUSTNAME}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								Customer ID: {customer?.customer_id || customer?.V_CUSTOMERID}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								PAN/Government Id No: {customer?.id_no || 'N/A'}
							</UI.CustomerListCardItem>
							<UI.CustomerListCardItem>
								Mobile: {customer?.mobile_flag}
							</UI.CustomerListCardItem>
							{/* TODO: not available in ddupe api request to client/shubham for this data */}
							{/* <UI.CustomerListCardItem>
							Product: LAP (mapping pending)
						</UI.CustomerListCardItem> */}
						</UI.CustomerListCard>
					))}
					<UI.CustomerDetailsFormModalFooter>
						{setSelectedCustomer && (
							<Button
								disabled={!selectedCustomer || sendingOTP}
								isLoader={sendingOTP}
								name='Proceed'
								onClick={onProceedSelectCustomer}
								fill
							/>
						)}
					</UI.CustomerDetailsFormModalFooter>
				</UI.CustomerListWrapper>
			</Modal>
		</>
	);
}
// {
//     "is_otp_required": false,
//     "search_api": "http://20.204.69.253:3200/Ucic/search",
//     "verify": "http://20.204.69.253:3200/Ucic/fetchData",
//     "product_id": [
//         14,
//         47
//     ]
// }

// {
//     "is_otp_required": true,
//     "search_api": "http://20.204.69.253:1338/ddupe_check",
//     "generate_otp": "http://20.204.69.253:1338/verify_customer",
//     "verify": "http://20.204.69.253:1338/get_customer_details",
//     "product_id": [
//         39,
//         41
//     ]
// }
