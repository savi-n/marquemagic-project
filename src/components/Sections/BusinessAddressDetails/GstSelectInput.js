/* Input field for Select type */

import styled from 'styled-components';
import { useState } from 'react';

const Select = styled.select`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	${({ disabled }) => disabled && `cursor: not-allowed;`}
`;

const Div = styled.div`
	position: relative;
`;

const Label = styled.label`
	font-weight: bold;
`;

export default function GstSelectInput({ gstNumbers, placeholder }) {
	const [selectedOption, setSelectedOption] = useState('');

	function handleSelectChange(event) {
		setSelectedOption(event.target.value);
	}
	return (
		<Div>
			<Label htmlFor='gst-options' aria-required>
				Select the GSTIN to prepopulate the address
			</Label>
			<Select
				id='gst-options'
				value={selectedOption}
				onChange={handleSelectChange}
			>
				<option disabled value=''>
					{placeholder}
				</option>
				{gstNumbers.map(gstNum => (
					<option
						disabled={gstNum.status !== 'Active' ? true : false}
						key={gstNum.gstin}
						value={gstNum.gstin}
					>
						{gstNum.gstin} - {gstNum.status}
					</option>
				))}
			</Select>
		</Div>
	);
}
