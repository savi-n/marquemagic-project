import React from 'react';
import * as UI from './ui';

const DedupeMatchTable = props => {
	const { data } = props;
	if (!data || data.length === 0) {
		return null;
	}

	// Extract the headers from the first object in the data array
	// const headers = Object.keys(data[0]);

	// This can be later passed as props
	const HEADER_MAPPING = {
		loan_ref_id: 'Loan ID',
		match: 'Match %',
		name: 'Name',
		product: 'Product',
		branch: 'Branch',
		amount: 'Amount',
		stage: 'Stage',
	};
	const columns = Object.keys(HEADER_MAPPING);
	return (
		<UI.Table>
			<thead>
				<UI.TableRow>
					{columns.map(header => (
						<UI.TableHeader key={header}>
							{HEADER_MAPPING[header]}
						</UI.TableHeader>
					))}
				</UI.TableRow>
			</thead>
			<tbody>
				{data.map((item, index) => (
					<UI.TableRow key={index}>
						{columns.map(column => (
							<UI.TableCell key={column}>
								{column === 'match' ? (
									<>
										{item[column]}
										<UI.ProgressBar>
											<UI.ProgressFiller
												percentage={parseInt(item[column], 10)}
											/>
										</UI.ProgressBar>
									</>
								) : (
									item[column]?.branch || item[column] || '---'
								)}
							</UI.TableCell>
						))}
					</UI.TableRow>
				))}
			</tbody>
		</UI.Table>
	);
};

export default DedupeMatchTable;
