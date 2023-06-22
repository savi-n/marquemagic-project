/* Certain Input fields in the form are kept disabled as
the data is extracted from extraction API and shouldnt be altered.
For such fields, this disabledInput is created */

import styled from 'styled-components';

const Input = styled.input`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	${({ disabled }) => disabled && `cursor: not-allowed;`}
	/* Chrome, Safari, Edge, Opera */
	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
		-moz-appearance: textfield;
		margin: 0;
	}
	@media (max-width: 700px) {
		:focus {
			::placeholder {
				color: white;
			}
		}
	}
`;
//  ${({ error }) =>
// 		error ? `border: 1px solid red; outline-color: red;` : ``}
// TODO: handler error
//  ${({ error }) =>
// 		error ? `border: 1px solid red; outline-color: red;` : ``}
// TODO: handler error

const Div = styled.div`
	display: 'flex';
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
	${Input}:focus ~ & {
		top: -15%;
		left: 2%;
		font-size: 10px;
		color: black;
		height: 20px;
		padding: 0 5px;
		line-height: 1;
		width: fit-content;
		/* border: 1px solid red; */
	}
	${({ value }) =>
		value
			? `
      top: -15%;
      left: 2%;
      font-size: 10px;
      color: black;
      height: 20px;
      padding: 0 5px;
			line-height: 1;
			width: fit-content;
  `
			: `
      top: 4%;
      left: 1%;
      height: 45px;
      width: 98%;
      color: lightgray;
      padding: 0 10px;
  `}

	${({ disabled }) =>
		disabled &&
		`
    background: #fafafa;
		cursor: not-allowed;
  `}
`;

const FieldPostfixIcon = styled.span`
	display: flex;
	position: absolute;
	height: 2rem;
	width: 2rem;
	margin: 5px;
	background: #dce2f7;
	border-radius: 50%;
	right: 0;
	top: 0;
	font-size: 16px;
	color: black;
	line-height: 50px;
	/* margin: 3% 3% 3% 3%; */
	z-index: 10;
	text-align: center;
	align-items: center;
	justify-content: center;
	cursor: pointer;
`;

export default function DisabledTextFieldModal(props) {
	const { value, length } = props;
	// console.log('DisabledTextFieldModal-', props);
	return (
		<Div>
			<Input
				value={!!value ? value : null}
				id={props.name}
				placeholder={props.placeholder}
				{...props}
				disabled
			/>
			<Label
				htmlFor={props.name}
				disabled={props.disabled}
				style={{
					color: 'black',
				}}
				value={value}
			>
				{props.placeholder}
				{/* {!!value ? value : null} */}
			</Label>
			{length > 1 ? (
				<FieldPostfixIcon onClick={props.onClick} state={true}>
					+{length - 1}
				</FieldPostfixIcon>
			) : null}
		</Div>
	);
}

//var arr[100]
// height: 25px;
//   width: 25px;
//   background-color: #bbb;
//   border-radius: 50%;
//   display: inline-block;
//state= false
//display=!!state?true:none
