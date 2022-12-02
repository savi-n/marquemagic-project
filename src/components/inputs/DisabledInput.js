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
	z-index: 9;
	display: flex;
	align-items: center;
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
	z-index: 999;
	font-size: 12px;
	color: grey;
	line-height: 50px;
	margin-right: 3%;
`;

export default function DisabledInput(props) {
	return (
		<Div>
			<Input id={props.name} {...props} disabled>
				{props.name.includes('aadhaar') && props?.value?.length === 12
					? props?.pattern?.repeat(props.value.length - 4) +
					  props?.value?.slice(8, 12)
					: props?.pattern?.repeat(props.value.length)}
			</Input>
			<Label value={props.value} htmlFor={props.name} disabled={props.disabled}>
				<Span>
					{props.placeholder}{' '}
					{props?.rules?.minValue && `min ${props?.rules?.minValue}`}
					{props?.rules?.minValue && props?.rules?.maxValue ? ' - ' : ' '}
					{props?.rules?.maxValue && `max ${props?.rules?.maxValue}`}
				</Span>
				{props.rules?.required && <Asteris>*</Asteris>}
			</Label>
			{props.inrupees && (
				<FieldPostfixIcon
					style={{
						position: 'absolute',
						right: 0,
						top: 0,
						zIndex: 999,
						fontSize: '12px',
						color: 'grey',
						lineHeight: '50px',
						marginRight: '3%',
					}}
				>
					(In ₹)
				</FieldPostfixIcon>
			)}
		</Div>
	);
}
