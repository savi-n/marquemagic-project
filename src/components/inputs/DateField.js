/* Input field for Date type */

import styled from 'styled-components';

const Input = styled.input`
	height: 50px;
	padding: 10px;
	width: 100%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	@media (max-width: 700px) {
		padding: 2px;
	}
`;
//  ${({ error }) =>
// 		error ? `border: 1px solid red; outline-color: red;` : ``}
// TODO: handler error

const Div = styled.div`
	position: relative;
`;

const Label = styled.label`
	position: absolute;
	z-index: 9;
	display: flex;
	align-items: center;
	background: white;
	transition: 0.2s;

	${Input}:focus ~ & {
		top: -10%;
		left: 2%;
		font-size: 10px;
		color: black;
		height: 20px;
		padding: 0 5px;
		width: inherit;
	}
	${({ value }) =>
		value
			? `
      top: -10%;
      left: 2%;
      font-size:10px;
      color:black;
      height: 20px;
      padding:0 5px;
  `
			: `
      top: 3%;
      left: 1%;
      height: 45px;
      color: lightgray;
      padding: 0 10px;
  `}
	${({ disabled }) =>
		disabled &&
		`
    background: #fafafa;
  `}
`;

const Asteris = styled.span`
	color: red;
`;

export default function DateField(props) {
	return (
		<Div>
			<Input id={props.name} type={props.type} {...props} />
			<Label value={props.value} htmlFor={props.name} disabled={props.disabled}>
				{props.placeholder}
				{props.rules?.required && <Asteris>*</Asteris>}
			</Label>
		</Div>
	);
}
