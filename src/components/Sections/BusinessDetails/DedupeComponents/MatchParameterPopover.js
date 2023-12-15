import React from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
	position: relative;
	display: inline-block;
	cursor: pointer;

	&:hover .tooltip {
		display: block;
	}
`;

const Tooltip = styled.div`
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	width: 200px;
	padding: 10px;
	background-color: #f0f0f0;
	border: 1px solid #ccc;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	z-index: 1;
`;

const TooltipTable = styled.table`
	width: 100%;
	border-collapse: collapse;

	th,
	td {
		padding: 8px;
		text-align: left;
	}
`;

const MatchParameterPopover = ({ data, children }) => {
	console.log('am I rendered');
	const keysToShow =
		data &&
		Object.entries(data)
			?.filter(([key, value]) => value)
			?.map(([key]) => key);

	return (
		<TooltipContainer>
			{children}
			<Tooltip className='tooltip'>
				<TooltipTable>
					<tbody>
						{keysToShow?.map(key => (
							<tr key={key}>
								<th>{key}</th>
								<td>{data[key]}</td>
							</tr>
						))}
					</tbody>
				</TooltipTable>
			</Tooltip>
		</TooltipContainer>
	);
};

export default MatchParameterPopover;
