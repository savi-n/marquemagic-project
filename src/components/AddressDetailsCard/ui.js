import styled from 'styled-components';

export const ImageContent = styled.div`
	display: flex;
	background: #fff;
	width: 100%;
	height: fit-content;
	max-height: 60%;
	padding: 5px 2px 5px 2px;
	border-radius: 10px;
	position: absolute;
	bottom: 0;
`;

export const TextIcon = styled.img`
	height: 90px;
	width: 20%;
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
export const TextContent1 = styled.p`
	font-size: 12px;
`;
export const TextContent2 = styled.p`
	font-size: 12px;
`;
export const TextContent3 = styled.p`
	font-size: 12px;
`;
export const LatLongTimestamp = styled.p`
	font-size: 11px;
`;
