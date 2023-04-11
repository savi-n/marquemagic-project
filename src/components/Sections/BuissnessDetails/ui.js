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
	margin: 1rem;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const ProfilePicWrapper = styled.div`
	margin-bottom: 10px;
`;
export const TableParentDiv = styled.div`
	height: 300px;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
`;

export const TableHeader = styled.div`
	position: sticky;
	top: 0;
	display: flex;
	background-color: #f0f0f0;
`;
export const TableRowWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;
export const TableRow = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`;

export const TableCollumns = styled.div`
	flex: 1;
	padding: 8px;
	text-align: center;
`;