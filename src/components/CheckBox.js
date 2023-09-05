import React, { useState } from 'react';
import styled from 'styled-components';
const InputCheckbox = styled.input`
	margin-right: 10px;
`;
//  ${({ error }) =>
// 		error ? `border: 1px solid red; outline-color: red;` : ``}
// TODO: handler error

const Div = styled.div`
	position: relative;
	width: 100%;
`;

const Label = styled.label`
	position: absolute;
	/* display: none; */
	z-index: 9;
	display: flex;
	align-items: center;
	background: white;
	overflow: hidden;
	transition: 0.2s;
	/* @media (max-width: 700px) {
		${({ isLargeTextLable }) =>
			isLargeTextLable &&
			`
    width:150%;
  `}
	} */

`;

const Asteris = styled.span`
	color: red;
`;

const Span = styled.span`
	max-width: 100%;
	max-height: 100%;
`;

const FieldPostfixIcon = styled.span`
	position: absolute;
	right: 0;
	top: 0;
	font-size: 12px;
	color: grey;
	line-height: 50px;
	margin-right: 3%;
	z-index: 10;
`;

const Checkbox = props => {
	const { checked, label, onChange, customStyle } = props;
	return (
		<div className='checkbox-wrapper'>
			<label>
				<InputCheckbox
					type='checkbox'
					checked={!!checked}
					onChange={()=>onChange(props.field.name)}
					style={customStyle}
					value={!!checked}
					{...props}
				/>
				<span>{label}</span>
			</label>
		</div>
	);
};
export default Checkbox;
