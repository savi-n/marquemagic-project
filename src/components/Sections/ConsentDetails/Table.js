import React from 'react';
import * as UI from './ui.js';
import Button from 'components/Button.js';

const Table = ({ headers, data, fetchHandle, hasSeperator }) => {
	return (
		<>
			<UI.TableContainer>
				<UI.TableHeader>
					{headers.map(header => (
						<UI.TableCell key={header}>{header}</UI.TableCell>
					))}
				</UI.TableHeader>
				{console.log(data)}
				{data.map((rowData, rowIndex) => (
					<UI.TableRow key={rowIndex}>
						{headers.map(header => (
							<UI.TableCell key={header}>{rowData[header]}</UI.TableCell>
						))}
						<UI.TableCell>
							<Button name='Fetch' onClick={() => fetchHandle(rowData)} />
						</UI.TableCell>
					</UI.TableRow>
				))}
			</UI.TableContainer>
			{hasSeperator && <UI.HR />}
		</>
	);
};

export default Table;
