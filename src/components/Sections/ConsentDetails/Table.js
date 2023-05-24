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
}) => {
	return (
		<>
			<UI.TableContainer>
				<UI.TableHeader>
					{headers.map(header => (
						<UI.TableCell key={header}>{header}</UI.TableCell>
					))}
				</UI.TableHeader>
				{data.map((rowData, rowIndex) => (
					<Single
						headers={headers}
						rowData={rowData}
						key={rowIndex}
						section={section}
						application={application}
					/>
				))}
			</UI.TableContainer>
			{hasSeperator && <UI.HR />}
		</>
	);
};


export default Table;
