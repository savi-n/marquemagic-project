/* This section is seen in Document upload section where checkbox is placed*/

import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import React, { useState } from 'react';

const InputCheckBox = styled.input`
	+ label {
		font-size: 15px;
		position: relative;
		padding-left: 10px;
		display: block;
		cursor: pointer;
		min-height: 15px;

		/* &::before {
			content: '';
			min-width: 15px;
			height: 15px;
			border: 1px solid;
			position: absolute;
			top: 4px;
			left: 0;
			border-color: ${({ checked, bg }) => (checked ? bg : 'black')};
			border-radius: ${({ round }) => (round ? '50%' : '4px')};
			background: ${({ checked, bg }) => (checked ? bg : 'transparent')};
			${({ disabled }) =>
				disabled &&
				`
				background: lightgrey;
				cursor: not-allowed;
				border: none;
			`}
		}

		&::after {
			${({ checked }) =>
				checked &&
				`
          content:'\\2713';
        `}
			position: absolute;
			left: 0;
			width: 15px;
			height: 15px;
			top: 4px;
			color: ${({ fg }) => fg ?? 'white'};
			font-size: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
			background: transparent;
			transform: rotate(10deg);
			${({ disabled }) =>
				disabled &&
				`
				cursor: not-allowed;
			`}
		} */
	}
`;

export default function CheckBox(props) {
	console.log(props);
	const { onChange, checked, round, disabled, bg, fg, placeholder } = props;
	const id = uuidv4();

	function handleChange(event) {
		const { checked, name, type, value } = event.target;
		let reqBody = { ...event };
		reqBody.target.value = checked;
		console.log(reqBody, 'REQ BODY');
		console.log(value, 'VALUE SDA');
		if (disabled) return;
		onChange(reqBody);
	}

	return (
		<section className='flex items-center'>
			<InputCheckBox
				name={props.name}
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
		</section>
	);
}
