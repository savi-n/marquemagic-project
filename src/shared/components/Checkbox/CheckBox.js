/* This section is seen in Document upload section where checkbox is placed*/

import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

const InputCheckBox = styled.input`
	display: none;
	+ label {
		font-size: 15px;
		position: relative;
		padding-left: 25px;
		display: block;
		cursor: pointer;
		min-height: 15px;

		&::before {
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
				background: #fafafa;
				background-color: #fafafa;
				cursor: not-allowed;
			`}
		}
	}
`;

export default function CheckBox({
	name,
	onChange,
	checked,
	round,
	disabled,
	bg,
	fg,
}) {
	const id = uuidv4();

	function handleChange(event) {
		if (disabled) return;
		const { checked } = event.target;
		onChange(checked);
	}

	return (
		<section className='flex items-center'>
			<InputCheckBox
				type='checkbox'
				id={id}
				onChange={handleChange}
				checked={checked}
				disabled={disabled}
				round={round}
				bg={bg}
				fg={fg}
			/>
			<label htmlFor={id}>{name}</label>
		</section>
	);
}

// CheckBox.defaultProps = {
// 	name: '',
// 	onChange: () => {},
// 	style: {},
// 	checked: false,
// 	round: false,
// 	disabled: false,
// 	bg: 'transparent',
// 	fg: 'white',
// };

// CheckBox.propTypes = {
// 	name: string,
// 	checked: bool,
// 	onChange: func,
// 	round: bool,
// 	disabled: bool,
// 	bg: string,
// 	fg: string,
// 	style: object,
// };
