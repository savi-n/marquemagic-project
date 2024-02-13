import React from 'react';
import Modal from 'components/Modal'; // Assuming you have a Modal component
import * as UI from './ui'; // Assuming you have a UI component with ImgClose component
import imgClose from 'assets/icons/close_icon_grey-06.svg'; // Path to your close image

function UdyamModal({ show, onClose, udyamOrganisationDetails }) {
	return (
		<Modal
			show={show}
			onClose={onClose}
			width='45%'
			customStyle={{ padding: '35px' }}
		>
			<section>
				<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
				{/* Display Udyam Organisation Details */}
				<div>
					<h2>Udyam Organisation Details</h2>
					<p>Organization Name: {udyamOrganisationDetails.organisation_name}</p>
					<p>
						Date of Incorporation:
						{udyamOrganisationDetails.date_of_incorporation}
					</p>
					<p>
						Date of Registration:
						{udyamOrganisationDetails.date_of_registration}
					</p>
					<p>Organisation Type: {udyamOrganisationDetails.organisation_type}</p>
					<p>Business Address: {udyamOrganisationDetails.business_address}</p>
					<p>Mobile Number: {udyamOrganisationDetails.mobile_number}</p>
				</div>
			</section>
		</Modal>
	);
}

export default UdyamModal;
