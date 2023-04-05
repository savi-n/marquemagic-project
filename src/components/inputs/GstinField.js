/* Certain Input fields in the form are kept disabled as
the data is extracted from extraction API and shouldnt be altered.
For such fields, this disabledInput is created */

import styled from 'styled-components';

const Input = styled.div`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	color: rgba(0, 0, 0, 0.4) !important;
	background-color: rgba(239, 239, 239, 0.3);
	display: flex;
	align-items: center;
	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
		-moz-appearance: textfield;
		margin: 0;
	}
`;
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
	z-index: 9;
	display: flex;
	align-items: center;
	color: black;
	background: white;
	overflow: hidden;
	transition: 0.2s;

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
	background: #dce2f7;
	border-radius: 50%;
	right: 0;
	top: 0;
	font-size: 16px;
	color: black;
	line-height: 50px;
	/* margin: 3% 3% 3% 3%; */
	margin-top: 2%;
	margin-bottom: 1%;
	margin-right: 3%;
	z-index: 10;
	text-align: center;
	align-items: center;
	justify-content: center;
`;

export default function DisabledTextFieldModal(props) {
	const { value, length, placeholder } = props;
	return (
		<Div>
			<Input />
			<Label
				style={{
					color: 'black',
				}}
			>
				{!!value ? value : <span>GST In</span>}
			</Label>
			<FieldPostfixIcon onClick={props.onClick}>{length}</FieldPostfixIcon>
		</Div>
	);
}

// height: 25px;
//   width: 25px;
//   background-color: #bbb;
//   border-radius: 50%;
//   display: inline-block;
