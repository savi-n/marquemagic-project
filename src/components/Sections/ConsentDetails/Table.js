import React from 'react';
import * as UI from './ui.js';
import Button from 'components/Button.js';

const Table = ({
	headers,
	data,
	fetchHandle,
	hasSeperator,
	buttonDisabled,
	section,
}) => {
	// Mapping headers title to corresponding table object keys
	const mapping = {
		'Aadhar Number': 'aadhaar',
		'Applicant Name': 'name',
		Status: 'status',
		'PAN Number': 'pan',
		'Company Name': 'name',
		'GST Number': 'gstin',
		// 'Itr Number': 'itr_num',
	};
	const enabledSection = 'ITR';
	return (
		<>
			<UI.TableContainer>
				<UI.TableHeader>
					{headers.map(header => (
						<UI.TableCell key={header}>{header}</UI.TableCell>
					))}
				</UI.TableHeader>
				{data.map((rowData, rowIndex) => (
					<UI.TableRow key={rowIndex}>
						{headers.map(header => (
							<UI.TableCell key={header}>
								{rowData[mapping[header]]}
							</UI.TableCell>
						))}
						<UI.TableCell>
							<Button
								name={rowData.status === 'Fetched' ? 'Fetched' : 'Fetch'}
								onClick={() =>
									section === enabledSection &&
									fetchHandle({ ...rowData, section })
								}
								disabled={
									buttonDisabled ||
									rowData.status === 'Fetched' ||
									rowData.status === 'In Progress'
								}
							/>
						</UI.TableCell>
					</UI.TableRow>
				))}
			</UI.TableContainer>
			{hasSeperator && <UI.HR />}
		</>
	);
};

export default Table;
