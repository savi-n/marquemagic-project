/* ROC buisness details Modal - In Business details page there is a button - View buisness details
	On click a modal pops up which shows information like Pan Number, CIN, Registration number etc.
	This section is defined here
*/

import { useContext } from 'react';
import styled from 'styled-components';

import Modal from './Modal';
import Button from './Button';
import { BussinesContext } from 'reducer/bussinessReducer';

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

export default function ROCBusinessDetailsModal({ onClose }) {
	const {
		state: { companyDetail },
	} = useContext(BussinesContext);
	const isUdhyog = sessionStorage.getItem('product') === 'udhyog';
	return (
		<Modal show={true} onClose={onClose} width='50%'>
			<Div>
				<Row>
					<Colm1>Business Name</Colm1>
					<Colm2>
						{companyDetail?.BusinessName ||
							JSON.parse(sessionStorage.getItem('companyData'))?.BusinessName}
					</Colm2>
				</Row>

				<Row>
					<Colm1>Email</Colm1>
					<Colm2>
						{companyDetail?.Email ||
							JSON.parse(sessionStorage.getItem('companyData'))?.Email}
					</Colm2>
				</Row>
				<Row>
					<Colm1>Address</Colm1>
					{!isUdhyog && (
						<Colm2>
							<Colm2>
								{companyDetail?.Address ||
									JSON.parse(sessionStorage.getItem('companyData'))?.Address}
							</Colm2>
						</Colm2>
					)}
					{isUdhyog && (
						<Colm2 className='flex flex-col items-start'>
							<span>
								{companyDetail?.Address?.bno +
									' ' +
									companyDetail?.Address?.st +
									' ' +
									companyDetail?.Address?.loc +
									' ' +
									companyDetail?.Address?.dst +
									' ' +
									companyDetail?.Address?.pncd +
									' ' +
									companyDetail?.Address?.stcd}
							</span>
						</Colm2>
					)}
				</Row>

				<Row>
					<Colm1>Pancard Number</Colm1>
					<Colm2>
						{companyDetail?.PancardNumber ||
							JSON.parse(sessionStorage.getItem('formstatepan'))?.values
								?.panNumber ||
							JSON.parse(sessionStorage.getItem('formstate'))}
					</Colm2>
				</Row>

				<Row>
					<Colm1>CIN</Colm1>
					<Colm2>
						{companyDetail?.CIN ||
							JSON.parse(sessionStorage.getItem('companyData'))?.CIN}
					</Colm2>
				</Row>

				<Row>
					<Colm1>Registration Number</Colm1>
					<Colm2>
						{companyDetail?.RegistrationNumber ||
							JSON.parse(sessionStorage.getItem('companyData'))
								?.RegistrationNumber}
					</Colm2>
				</Row>
				<Row>
					<Colm1>Company Category</Colm1>
					<Colm2>
						{companyDetail?.CompanyCategory ||
							JSON.parse(sessionStorage.getItem('companyData'))
								?.CompanyCategory}
					</Colm2>
				</Row>

				{companyDetail?.directorsForShow?.length > 0 ||
					(JSON.parse(sessionStorage.getItem('companyData'))?.DirectorDetails
						?.length > 0 ? (
						<>
							<Header>Directors/Partners</Header>
							<Row>
								<Colm1>Name</Colm1>
								<Colm2>Din</Colm2>
							</Row>
							{companyDetail?.directorsForShow?.map((dir, index) => (
								<Row key={index}>
									<Colm1>{dir?.Name}</Colm1>
									<Colm2>{dir?.Din}</Colm2>
								</Row>
							))}
						</>
					) : null)}
			</Div>
			<Button name='Close' onClick={onClose} />
		</Modal>
	);
}
