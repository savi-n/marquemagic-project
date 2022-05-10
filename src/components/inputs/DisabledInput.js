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
  `}
`;

const Asteris = styled.span`
	color: red;
`;

const Span = styled.span`
	max-width: 100%;
	max-height: 100%;
`;

export default function DisabledInput(props) {
	return (
		<Div>
			<Input id={props.name}>
				{props.name === 'aadhaar' && props?.value?.length === 12
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
		</Div>
	);
}
