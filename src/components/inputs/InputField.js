/* Input field for Input type */

import styled from 'styled-components';

const Input = styled.input`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	${({ disabled }) => disabled && `cursor: not-allowed;`}
`;

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

	@media (max-width: 700px) {
		${({ isLargeTextLable }) =>
			isLargeTextLable &&
			`
    width:150%;
  `}
	}
	${Input}:focus ~ & {
		top: -14%;
		left: 2%;
		font-size: 10px;
		color: black;
		height: auto;
		padding: 0 2px;
		line-height: 1;
		width: fit-content;
	}
	${({ value }) =>
		value
			? `
      top: -14%;
      left: 2%;
      font-size:10px;
      color:black;
      /* height: 20%; */
      padding:0 2px;
  `
			: `
      top: 3%;
      left: 1%;
      height: 90%;
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

const Asteris = styled.span`
	color: red;
`;

const Span = styled.span`
	max-width: 100%;
	max-height: 100%;
`;

export default function InputField(props) {
	const isLargeTextLable = props.name.length > 15;
	return (
		<Div>
			<Input id={props.name} type={props.type} {...props} />
			<Label
				isLargeTextLable={isLargeTextLable}
				value={props.value}
				htmlFor={props.name}
				disabled={props.disabled}>
				<Span>
					{props.placeholder}{' '}
					{props?.rules?.minValue && `min ${props?.rules?.minValue}`}
					{props?.rules?.minValue && props?.rules?.maxValue ? ' - ' : ' '}
					{props?.rules?.maxValue && `max ${props?.rules?.maxValue}`}
				</Span>
				{props.rules?.required && <Asteris>*</Asteris>}
			</Label>
		</Div>
	);
}
