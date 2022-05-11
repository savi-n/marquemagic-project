import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const BACKSPACE = 8;
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const DELETE = 46;
const SPACEBAR = 32;

const OTPWrapper = styled.div`
	display: flex;
	align-items: center;
	/* gap: 10px; */
	width: 100%;
	justify-content: center;
	@media (max-width: 700px) {
		gap: 0px;
	}
`;

const SytledInput = styled.input`
	width: 48px;
	height: 48px;
	outline: none;
	border: 1px solid;
	margin: 10px;
	padding: 10px;
	cursor: pointer;
	border-radius: 5px;
	/* background-color: #d8d8d8; */
	border-color: #c1c7cd;
	color: #3f4254;
	text-align: center;
	transition: color 0.15s ease, background-color 0.15s ease,
		border-color 0.15s ease, box-shadow 0.15s ease;

	&:focus {
		background-color: #ebedf3;
		border-color: #ebedf3;
	}
	@media (max-width: 700px) {
		margin: 5px;
	}
`;

function OtpField({
	type,
	index,
	value = '',
	activeInput,
	onChange,
	isInputNum = false,
	onKeyDown,
}) {
	const inputRef = useRef();

	useEffect(() => {
		if (index === activeInput) {
			inputRef.current.focus();
			inputRef.current.select();
		}

		return () => {};
	}, [activeInput]);

	const isInputValueValid = value => {
		const isTypeValid = isInputNum
			? !isNaN(parseInt(value, 10))
			: typeof value === 'string';

		return isTypeValid && value.trim().length === 1;
	};

	const handleInput = event => {
		const { value } = event.target;
		if (isInputValueValid(value)) {
			onChange(index, value);
		}
	};

	return (
		<SytledInput
			type={type}
			ref={inputRef}
			value={value}
			onChange={handleInput}
			onInput={handleInput}
			autoComplete='off'
			maxLength='1'
			onKeyDown={onKeyDown}
		/>
	);
}

export default function OtpInput({
	numInputs = 4,
	handleChange = otp => console.log(otp),
	isInputSecure = false,
	numberOnly = false,
	setInputAadhaarOTP,
}) {
	const [activeInput, setActiveInput] = useState(0);

	const [otpArray, setOtpArray] = useState(
		Array.from({ length: numInputs }, () => '')
	);

	const onChange = (index, value) => {
		if (numberOnly && isNaN(value)) {
			return;
		}

		const otpArr = [...otpArray];
		otpArr[index] = value;

		setOtpArray(otpArr);
		const otpString = otpArr.join('');
		handleChange(otpString);
		// sessionStorage.setItem('inputAadhaarOTP', otpString);
		setInputAadhaarOTP(otpString);
		if (value) focusNext(index);
	};

	const focusNext = index => {
		const lastChild = index === numInputs - 1;
		if (!lastChild) {
			setActiveInput(index + 1);
		}
	};

	const focusPrev = index => {
		if (index) {
			setActiveInput(index - 1);
		}
	};

	const handleOnKeyDown = (e, index) => {
		if (e.keyCode === BACKSPACE || e.key === 'Backspace') {
			e.preventDefault();
			onChange(index, '');
			focusPrev(index);
		} else if (e.keyCode === DELETE || e.key === 'Delete') {
			e.preventDefault();
			onChange(index, '');
		} else if (e.keyCode === LEFT_ARROW || e.key === 'ArrowLeft') {
			e.preventDefault();
			focusPrev(index);
		} else if (e.keyCode === RIGHT_ARROW || e.key === 'ArrowRight') {
			e.preventDefault();
			focusNext(index);
		} else if (
			e.keyCode === SPACEBAR ||
			e.key === ' ' ||
			e.key === 'Spacebar' ||
			e.key === 'Space'
		) {
			e.preventDefault();
		}
	};

	const render = () => {
		let inputs = [];
		for (let i = 0; i < numInputs; i++) {
			inputs.push(
				<OtpField
					key={i}
					index={i}
					activeInput={activeInput}
					type={isInputSecure ? 'password' : 'text'}
					onChange={onChange}
					onKeyDown={e => handleOnKeyDown(e, i)}
					onFocus={e => {
						setActiveInput(i);
					}}
					value={otpArray[i]}
				/>
			);
		}
		return inputs;
	};
	return <OTPWrapper>{render()}</OTPWrapper>;
}
