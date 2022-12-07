import React from 'react';
import styled from 'styled-components';

const RadioButtonWrapper = styled.div`
	display: flex;
	@media (max-width: 700px) {
		display: inline-block;
	}
`;

const CardRadioButton = styled.div`
	/* box-shadow: 0 4px 9px 0 #bdd2ef; */
	box-shadow: rgb(11 92 255 / 16%) 0px 2px 5px 1px;
	width: 155px;
	height: 45px;
	line-height: 45px;
	margin-top: 5px;
	margin-right: 20px;
	padding-left: 20px;
	border-radius: 6px;
	text-align: left;
	input {
		cursor: pointer;
	}
	label {
		padding-left: 10px;
		cursor: pointer;
	}
	@media (max-width: 700px) {
		margin-bottom: 15px;
	}
`;

const AddressProofRadio = props => {
	const { name, value, onChange, options, disabled } = props;
	// console.log('AddressProofRadio-', { props });
	return (
		<RadioButtonWrapper>
			{options?.map((option, optionIndex) => {
				return (
					<CardRadioButton key={`option${optionIndex}${option.value}`}>
						<input
							id={`${name}${option.value}`}
							name={name}
							type='radio'
							value={option.value}
							onChange={onChange}
							checked={value === option.value}
							visibility='visible'
							disabled={!!disabled}
						/>
						<label
							htmlFor={`${name}${option.value}`}
							style={{ marginLeft: '10px' }}
						>
							{option.label}
						</label>
					</CardRadioButton>
				);
			})}
		</RadioButtonWrapper>
	);
};

export default AddressProofRadio;
