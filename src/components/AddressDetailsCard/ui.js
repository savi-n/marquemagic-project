import styled from 'styled-components';

export const ImageContent = styled.div`
	z-index: 999999;
	display: flex;
	background: #fff;
	/* width: 100%; */
	height: fit-content;
	max-height: 60%;
	min-height: 85px;
	padding: 5px 2px 5px 2px;
	border-radius: 10px;
	/* position: absolute; */
	bottom: 0;
	position: ${({ embedInImageUpload }) => embedInImageUpload && 'absolute'};
	width: 100%;
	box-shadow: 5px 7px 15px 1px silver;
`;

export const TextIcon = styled.img`
	height: 90px;
	width: 90px;
	@media (max-width: 1100px) {
		height: 60px;
		width: 60px;
	}
`;

export const ImageText = styled.p`
	@media (max-width: 767px) {
		font-size: 11px;
	}
	font-size: 14px;
	color: black;
	padding: 0 10px 0 10px;
	width: 80%;
`;

export const CloseIcon = styled.img`
	width: 18px;
	height: 18px;
	margin: 0 5px 0 5px;
	cursor: pointer;
`;

export const TextHeader = styled.h2`
	font-weight: bold;
	font-size: 12px;
`;
export const TextContent = styled.p`
	font-size: 12px;
	@media (max-width: 1100px) {
		font-size: 10px;
	}
`;
