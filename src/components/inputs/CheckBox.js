/* This section is seen in Document upload section where checkbox is placed*/

import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import React, { useState } from 'react';

const InputCheckBox = styled.input`
padding:10px ;
${({ disabled }) => disabled && `cursor: not-allowed;`}
`;
const Div=styled.div`
display: flex;
gap: 10px;
`
export default function CheckBox(props) {
	console.log(props);
	const { onChange, round, disabled, bg, fg, placeholder, name } = props;
	const id = uuidv4();

	function handleChange(event) {
		const { checked } = event.target;
		let reqBody = { ...event };
		reqBody.target.value = checked;
		if (disabled) return;
		onChange(reqBody);
	}

	return (
		<Div className='flex items-center'>
			<InputCheckBox
				name={name}
				type='checkbox'
				id={id}
				onChange={handleChange}
				checked={props.value === 'true'}
				disabled={disabled}
				round={round}
				bg={bg}
				fg={fg}
			/>
			<label htmlFor={id}>{placeholder}</label>
		</Div>
	);
}
