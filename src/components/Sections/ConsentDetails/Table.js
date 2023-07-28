import React from 'react';
import * as UI from './ui.js';
import Single from './Single.js';
const Table = ({
	headers,
	data,
	section,
	hasSeperator,
	buttonDisabled,
	application,
	token,
	fetchConsentDetails,
}) => {
	return (
		<>
			<UI.TableContainer>
				<UI.TableHeader>
					{headers?.map(header => (
						<UI.TableCell key={header}>
							{header !== 'Director ID' && header}
							{/* {header} */}
						</UI.TableCell>
					))}
				</UI.TableHeader>
				{data?.map((rowData, rowIndex) => (
					<Single
						fetchConsentDetails={fetchConsentDetails}
						headers={headers}
						rowData={rowData}
						key={rowIndex}
						section={section}
						token={token}
						application={application}
						buttonDisabled={buttonDisabled}
					/>
				))}
			</UI.TableContainer>
			{hasSeperator && <UI.HR />}
		</>
	);
};
export default Table;
