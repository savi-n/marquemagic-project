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
export const StyledTable = styled.table`
	margin: 0px 10px 10px 10px;
	caption-side: top;
	border: none;
	border-collapse: collapse;
	width: max-content;
	th {
		width: 150px;
	}
	td,
	th {
		border: none;
		padding: 10px 10px 10px 10px;
		top: auto;
	}
	thead {
		position: sticky;
		top: 0;
		width: 500px;
	}
	tbody {
		background-color: white;
		/* scroll-behavior: smooth; */
		overflow-x: hidden;
		overflow-y: auto;
	}
	td {
		padding: 10px 10px 10px 10px;
	}
`;