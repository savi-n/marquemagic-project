import styled from 'styled-components';

export const FieldWrapper = styled.div`
	display: flex;
	gap: 10px;
`;

export const ContainerPreview = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 6px;
	border: 2px dashed #4cc97f;
	color: #525252;
	outline: none;
	transition: all 0.3s ease-out;
	width: 100%;
	height: 50px;
	padding: 0 15px;
	${({ loading }) =>
		loading &&
		`border: dashed grey 2px;
    background-color: rgba(255,255,255,.8);`}
	${({ panErrorColorCode }) =>
		panErrorColorCode &&
		`border: dashed ${panErrorColorCode} 2px;
    background-color: rgba(255,255,255,.8);`}
`;

export const Container = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 6px;
	background-color: #dce2f7;
	border: 2px dashed #0000ff80;
	color: #525252;
	outline: none;
	transition: all 0.3s ease-out;
	width: 100%;
	height: 50px;
	padding: 0 15px;
	pointer-events: ${({ isDisabled }) => isDisabled && `none`};
	${({ loading }) =>
		loading &&
		`border: dashed grey 2px;
    background-color: rgba(255,255,255,.8);`}
	${({ panErrorColorCode }) =>
		panErrorColorCode &&
		`border: dashed ${panErrorColorCode} 2px;
    background-color: rgba(255,255,255,.8);`};
`;

export const IconDelete = styled.img`
	height: 30px;
	width: 30px;
`;

export const UploadIconWrapper = styled.div`
	/* border: 1px solid red; */
	position: absolute;
	right: 0;
	margin-right: 15px;
	cursor: pointer;
`;

export const IconUpload = styled.img`
	height: 30px;
	width: 30px;
`;
export const PreviewUploadIconWrapper = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	text-align: center;
	justify-content: center;
	border-radius: 6px;
	background-color: #dce2f7;
	border: 2px dashed #0000ff80;
	color: #525252;
	min-width: 50px;
	min-height: 50px;
`;

export const UploadedFileName = styled.div`
	cursor: pointer;
	&:hover {
		color: ${({ link }) => (link ? '#2a2add' : 'black')};
	}
`;

export const ConfirmPanWrapper = styled.div`
	padding: 40px 0;
	margin-right: auto;
	margin-left: auto;
	text-align: center;
	max-width: 400px;
`;

export const FieldWrapperPanVerify = styled.div`
	padding: 30px 10px;
	/* width: 50%; */
	place-self: center;

	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
