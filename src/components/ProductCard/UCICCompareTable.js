import moment from 'moment';
import React from 'react';
import Button from '../Button';
import styled from 'styled-components';

const Table = styled.table`
	margin-top: 30px;
`;

const TableRow = styled.tr`
	text-align: center;
`;

const TableHeadCell = styled.th`
	padding: 10px;
	border: 1px solid lightgrey;
`;

const TableCell = styled.td`
	padding: 10px;
	border: 1px solid lightgrey;
`;

const UCICCompareTable = ({
	customerList,
	filledFormData,
	onCancel = () => {},
	onUpdate = () => {},
}) => {
	const filledData = {
		name: `${filledFormData?.first_name} ${filledFormData?.last_name}`,
		dob: filledFormData?.dob
			? moment(filledFormData?.dob).format('YYYY-MM-DD')
			: '',
		pan: filledFormData?.pan_number,
		mobile: filledFormData?.mobile_no,
		email: filledFormData?.email,
	};

	const ucicData = {
		name: customerList?.[0]?.customer_name,
		dob: customerList?.[0]?.dob_flag
			? moment(customerList?.[0]?.dob_flag).format('YYYY-MM-DD')
			: '',
		pan: customerList?.[0]?.id_no,
		mobile: customerList?.[0]?.mobile_flag,
		email: customerList?.[0]?.email_flag,
		ucicNumber: customerList?.[0]?.customer_id,
	};

	const areDetailsSame =
		(!ucicData?.name || ucicData?.name === filledData?.name) &&
		(!ucicData?.dob || ucicData?.dob === filledData?.dob) &&
		(!ucicData?.pan || ucicData?.pan === filledData?.pan) &&
		(!ucicData?.email || ucicData?.email === filledData?.email) &&
		(!ucicData?.mobile || ucicData?.mobile === filledData?.mobile);

	return (
		<>
			<Table>
				<thead>
					<TableRow>
						<TableHeadCell />
						<TableHeadCell>From Form</TableHeadCell>
						<TableHeadCell>From UCIC</TableHeadCell>
					</TableRow>
				</thead>
				<tbody>
					<TableRow>
						<TableCell>Full Name</TableCell>
						<TableCell>{filledData?.name}</TableCell>
						<TableCell>{ucicData?.name}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Mobile Number</TableCell>
						<TableCell>{filledData?.mobile}</TableCell>
						<TableCell>{ucicData?.mobile}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>PAN</TableCell>
						<TableCell>{filledData?.pan}</TableCell>
						<TableCell>{ucicData?.pan}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Email</TableCell>
						<TableCell>{filledData?.email}</TableCell>
						<TableCell>{ucicData?.email}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>DOB</TableCell>
						<TableCell>{filledData?.dob}</TableCell>
						<TableCell>{ucicData?.dob}</TableCell>
					</TableRow>
				</tbody>
			</Table>
			{!areDetailsSame && (
				<span style={{ color: 'red' }}>
					There is mismatch in the details entered and details received from
					UCIC. Please update the form before updating the UCIC number.
				</span>
			)}
			<div
				style={{
					marginTop: '20px',
					marginLeft: 'auto',
					display: 'flex',
					gap: '10px',
				}}
			>
				<Button name='Cancel' onClick={onCancel} />
				<Button
					name='Update UCIC'
					fill={true}
					disabled={!areDetailsSame}
					onClick={() => onUpdate(ucicData?.ucicNumber)}
				/>
			</div>
		</>
	);
};

export default UCICCompareTable;
