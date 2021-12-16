import { useRef } from 'react';
import styled from 'styled-components';
import imgClose from 'assets/icons/close_icon_blue-06.svg';

const Wrapper = styled.div`
	position: absolute;
	/* padding: 10px; */
	/* bottom: 105%; */
	/* width: 250px; */
	/* right: 100px; */
	margin-left: -185px;
	margin-top: -50px;
	left: 0;
	top: 0;
	padding: 6px;
	/* background: #fff8f8; */
	/* backdrop-filter: blur(10px); */
	/* z-index: 998; */
	/* width: 220px; */
	margin-bottom: 100px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	/* box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%); */
	background: #c1e8ff;
	&::after {
		content: '';
		width: 0;
		height: 0;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-top: 10px solid #c1e8ff;
		position: absolute;
		top: 100%;
		right: 0;
		margin-right: 83px;
		/* right: 50px; */
		transform: translateX(-50%);
	}
`;

const Input = styled.input`
	height: 30px;
	line-height: 30px;
	padding: 10px;
	width: 160px;
	font-size: 14px;
	margin-right: 10px;
	/* border: 1px solid rgba(0, 0, 0, 0.1); */
	border-radius: 10px;
`;

/* --base-color: ${({ theme }) =>
  theme ? theme.main_theme_color : 'black'}; */
/* border: 2px solid var(--base-color);
	color: var(--base-color); */
/* padding: 8px; */
// font-weight: 800;
const Button = styled.button`
	color: #0000ff80;
	width: 100px;
	height: 30px;
	line-height: 30px;
	font-size: 12px;
	/* padding: 0 20px; */
	border-radius: 10px;
	background: white;
`;

const CancelBtn = styled.span`
	background: #f16a6a;
	border-radius: 50%;
	width: 20px;
	height: 20px;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	font-weight: 700;
	cursor: pointer;
	/* align-self: center; */
	margin-left: 10px;
`;

const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: 10px;
	margin-right: 5px;
`;

export default function FilePasswordInput({
	fileId,
	onClickCallback = () => {},
	onClose = () => {},
	uniqPassId = 0,
}) {
	const inputRef = useRef();

	const onClick = e => {
		e.preventDefault();
		e.stopPropagation();
		onClickCallback(fileId, inputRef.current.value, uniqPassId);
	};

	return (
		<Wrapper>
			<Input type='password' ref={inputRef} placeholder='Enter Password' />
			<Button onClick={onClick}>Submit</Button>
			<ImgClose src={imgClose} onClick={onClose} alt='close' />
			{/* <CancelBtn onClick={onClose}>&#10006;</CancelBtn> */}
		</Wrapper>
	);
}
