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
	display: flex;
	flex-direction: column;
	overflow-y: hidden;

	// hiding scroll bar, if the table is not in focus(hovered)
	&:hover {
		overflow-y: scroll;
		::-webkit-scrollbar {
			width: 7px;
			background-color: rgba(0, 0, 0, 0.2);
		}
		::-webkit-scrollbar-thumb {
			background-color: rgba(0, 0, 0, 0.5);
			border-radius: 3px;
		}
	}

	&.hide-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		transition: background-color 0.2s ease-in-out;
	}
	&.hide-scrollbar:hover::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.8);
	}
	&.hide-scrollbar:hover::-webkit-scrollbar-thumb:hover {
		background-color: rgba(0, 0, 0, 1);
	}
	&.hide-scrollbar {
		transition: 1s;
	}
`;

export const TableHeader = styled.div`
	padding: 5px;
	border-radius: 10px;
	position: sticky;
	top: 0;
	display: flex;
	background-color: #f0f0f0;
`;
export const TableDataRowWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;
export const TableRow = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`;

export const TableColumn = styled.div`
	flex: 1;
	padding: 8px;
	text-align: center;
`;
