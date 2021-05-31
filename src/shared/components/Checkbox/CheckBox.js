import { v4 as uuidv4 } from 'uuid';
import { string, func, object, bool } from 'prop-types';
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
			top: 1px;
			left: 0;
			border-color: ${({ checked, bg }) => (checked ? bg : 'black')};
			border-radius: ${({ round }) => (round ? '50%' : '4px')};
			background: ${({ checked, bg }) => (checked ? bg : 'transparent')};
		}

		&::after {
			${({ checked }) =>
				checked &&
				`
                content:'';
            `}
			width: 2px;
			height: 7px;
			border-right: 1px solid;
			border-bottom: 1px solid;
			position: absolute;
			top: 5px;
			left: 7px;
			border-color: ${({ fg }) => fg ?? 'white'};
			background: transparent;
			transform: rotate(45deg);
		}
	}
`;

export default function CheckBox({ name, onChange, checked, round, disabled, bg, fg }) {
	const id = uuidv4();

	function handleChange(event) {
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

CheckBox.defaultProps = {
	name: '',
	onChange: () => {},
	style: {},
	checked: false,
	round: false,
	disabled: false,
	bg: 'transparent',
	fg: 'white'
};

CheckBox.propTypes = {
	name: string,
	checked: bool,
	onChange: func,
	round: bool,
	disabled: bool,
	bg: string,
	fg: string,
	style: object
};
