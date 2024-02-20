import React from 'react';
import styled from 'styled-components';
import iconSuccess from '../../../../assets/icons/green_tick_icon.png';

const TooltipContainer = styled.div`
	position: relative;
	display: inline-block;
	cursor: pointer;

	&:hover .tooltip {
		display: block;
	}
`;

const ImgContainer = styled.img`
	width: 20px;
	height: 20px;
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

const ToolTipHeaderRow = styled.td`
	border-bottom: solid 1px gray;
	background-color: gray;
`;

const MatchParameterPopover = ({ data, children }) => {
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
						<thead>
							<tr>
								<ToolTipHeaderRow style={{ borderBottom: '1px solid gray' }}>
									Matched Parameters
								</ToolTipHeaderRow>
							</tr>
						</thead>
						{keysToShow?.map(key => (
							<tr key={key}>
								<th>{key?.split('_').join(' ')}</th>
								<td>
									<ImgContainer src={iconSuccess} alt='Matched Parameter' />
								</td>
							</tr>
						))}
					</tbody>
				</TooltipTable>
			</Tooltip>
		</TooltipContainer>
	);
};

export default MatchParameterPopover;
