/* ROC buisness details Modal - In Business details page there is a button - View buisness details
	On click a modal pops up which shows information like Pan Number, CIN, Registration number etc.
	This section is defined here
*/

import styled from 'styled-components';

import Modal from 'components/Modal';
import Button from 'components/Button';

const Div = styled.div`
	padding: 20px;
	@media (max-width: 700px) {
		padding: 0px;
	}
`;

const Row = styled.div`
	display: flex;
	margin: 10px 0;
	background: #efefef;
	padding: 20px 10px;
	border-radius: 10px;
`;

const Header = styled.div`
	display: flex;
	margin: 10px 0;
	font-size: 18px;
	font-weight: 900;
	padding: 20px 10px;
	border-radius: 10px;
`;

const Colm1 = styled.div`
	flex: 1;
	font-size: 15px;
	font-weight: 500;
`;

const Colm2 = styled.div`
	flex: 1;
	font-size: 15px;
	font-weight: 500;
	@media (max-width: 700px) {
		inline-size: min-content;
		width: 100px;
		height: auto;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

export default function ROCBusinessDetailsModal({
	onClose,
	show,
	companyDetails,
	id,
}) {
	const companyData = {};
	if (!!companyDetails?.cin) {
		companyData.BusinessName = companyDetails?.data?.llp?.company_name;
		companyData.Email = companyDetails?.data?.llp?.email_id;
		companyData.Address = companyDetails?.data?.llp?.registered_address;
		companyData.panNumber = id?.pan;
		companyData.CIN = companyDetails?.cin;
		companyData.RegistrationNumber =
			companyDetails?.data?.llp?.registration_number;
		companyData.CompanyCategory = companyDetails?.data?.llp?.company_category;
	}
	const isUdyog = !!id?.udyogAadhar;
	const businessAddress = [];
	if (companyDetails?.Address?.bno)
		businessAddress.push(companyDetails?.Address?.bno);
	if (companyDetails?.Address?.st)
		businessAddress.push(companyDetails?.Address?.st);
	if (companyDetails?.Address?.loc)
		businessAddress.push(companyDetails?.Address?.loc);
	if (companyDetails?.Address?.dst)
		businessAddress.push(companyDetails?.Address?.dst);
	if (companyDetails?.Address?.pncd)
		businessAddress.push(companyDetails?.Address?.pncd);
	if (companyDetails?.Address?.stcd)
		businessAddress.push(companyDetails?.Address?.stcd);

	const companyDirectorsForShow =
		companyDetails?.directorsForShow || companyDetails?.data?.director || [];
	return (
		<Modal show={show} onClose={onClose} width='50%'>
			<Div>
				<Row>
					<Colm1>Business Name</Colm1>
					<Colm2>
						{companyDetails?.BusinessName || companyData?.BusinessName}
					</Colm2>
				</Row>

				<Row>
					<Colm1>Email</Colm1>
					<Colm2>{companyDetails?.Email || companyData?.Email}</Colm2>
				</Row>
				<Row>
					<Colm1>Address</Colm1>
					{!isUdyog && (
						<Colm2>
							<Colm2>{companyDetails?.Address || companyData?.Address}</Colm2>
						</Colm2>
					)}
					{isUdyog && (
						<Colm2 className='flex flex-col items-start'>
							<span>{businessAddress.join(' ')}</span>
						</Colm2>
					)}
				</Row>

				<Row>
					<Colm1>Pancard Number</Colm1>
					<Colm2>{companyDetails?.panNumber || companyData?.panNumber}</Colm2>
				</Row>

				<Row>
					<Colm1>CIN</Colm1>
					<Colm2>{companyDetails?.CIN || companyData?.CIN}</Colm2>
				</Row>

				<Row>
					<Colm1>Registration Number</Colm1>
					<Colm2>
						{companyDetails?.RegistrationNumber ||
							companyData?.RegistrationNumber}
					</Colm2>
				</Row>
				<Row>
					<Colm1>Company Category</Colm1>
					<Colm2>
						{companyDetails?.CompanyCategory || companyData?.CompanyCategory}
					</Colm2>
				</Row>

				{companyDirectorsForShow?.length > 0 ? (
					<>
						<Header>Directors/Partners</Header>
						<Row>
							<Colm1>Name</Colm1>
							<Colm2>Din</Colm2>
						</Row>
						{companyDirectorsForShow?.map((dir, index) => (
							<Row key={index}>
								<Colm1>{dir?.Name || dir?.name}</Colm1>
								<Colm2>
									{dir?.Din ||
										dir?.assosiate_company_details?.director_data?.din}
								</Colm2>
							</Row>
						))}
					</>
				) : null}
			</Div>
			<Button name='Close' onClick={onClose} customStyle={{ float: 'right' }} />
		</Modal>
	);
}
