import styled from 'styled-components';

export const ImageContent = styled.div`
	/* z-index: 999999; */
	z-index: 1;
	display: flex;
	align-items: center;
	background: #fff;
	/* width: 100%; */
	height: fit-content;
	max-height: ${({ displayCompleteAddress }) =>
		displayCompleteAddress ? '100%' : '65%'};
	min-height: 100px;
	padding: 5px 5px 5px 5px;
	border-radius: 10px;
	/* position: absolute; */
	bottom: 0;
	position: ${({ embedInImageUpload }) => embedInImageUpload && 'absolute'};
	width: ${({ embedInImageUpload }) => (embedInImageUpload ? '100%' : '45%')};

	box-shadow: 1px 1px 1px 1px silver;
	@media (max-width: 768px) {
		width: 100% !important;
	}
`;

export const TextIcon = styled.img`
	border-radius: 10px;
	background-color: #f1f5ff;
	padding: 10px 5px 20px 5px;
	height: 90px;
	margin-left: 5px;
	object-fit: contain;
	@media (max-width: 767px) {
		height: 50px;
		padding: 5px 2px 15px 2px;
		object-fit: contain;
	}
`;

export const ImageText = styled.div`
	@media (max-width: 767px) {
		font-size: 11px;
	}
	font-size: 14px;
	color: #5a5a5a;
	padding: 0 10px 0 10px;
	width: 80%;
`;

export const CloseIcon = styled.img`
	align-self: flex-start;
	width: 18px;
	height: 18px;
	margin: 0 5px 0 5px;
	cursor: pointer;
`;

export const FullAddress = styled.span`
	cursor: pointer;
`;

export const TextHeader = styled.h2`
	font-weight: bold;
	font-size: 12px;
	font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
		monospace;
`;
export const TextContent = styled.p`
	height: fit-content;
	word-break: break-all;
	font-size: ${({ embedInImageUpload }) =>
		embedInImageUpload ? '12px' : '14px'};
	@media (max-width: 1100px) {
		font-size: 10px;
	}
`;

export const TextErr = styled.p`
	height: fit-content;
	word-break: break-all;
	color: red;
	font-weight: bold;
	font-size: '14px';
	@media (max-width: 1100px) {
		font-size: 10px;
	}
`;
