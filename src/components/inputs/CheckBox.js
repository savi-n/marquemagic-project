/* This section is seen in Document upload section where checkbox is placed*/

import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import React from 'react';

const InputCheckBox = styled.input`
	padding: 10px;
	margin: 5px 0;
	${({ disabled }) => disabled && `cursor: not-allowed;`}
	min-width: 16px;
	min-height: 16px;
`;
const Div = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 10px;
`;

const Asteris = styled.span`
	color: red;
`;

const Label = styled.label``;

export default function CheckBox(props) {
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
				value={props.value}
				id={id}
				onChange={handleChange}
				checked={props.value === 'true'}
				disabled={disabled}
				round={round}
				bg={bg}
				fg={fg}
			/>
			<Label htmlFor={id}>
				{props.rules?.required ? <Asteris>* </Asteris> : <Asteris> </Asteris>}
				{placeholder}
			</Label>
		</Div>
	);
}
