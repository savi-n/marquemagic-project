import React from 'react';
import styled from 'styled-components';
const InputCheckbox = styled.input`
	margin-right: 10px;
`;
//  ${({ error }) =>
// 		error ? `border: 1px solid red; outline-color: red;` : ``}
// TODO: handler error

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
