import styled from 'styled-components';

export const FieldWrapper = styled.div`
	display: flex;
	gap: 10px;
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

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;




export const ProfilePicWrapper = styled.div`
	margin-bottom: 10px;
`;
