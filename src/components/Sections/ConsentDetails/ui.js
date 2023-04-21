import styled from 'styled-components';

export const ImgClose = styled.img`
	height: 25px;
	margin: 1rem;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const TableWrapper = styled.div`
	margin-bottom: 40px;
`;

export const TableMainHeader = styled.div`
	font-weight: bold;
	color: #4e4e4e;
	font-size: 1.2rem;
	background-color: #f0f0f0;
	padding: 13px;
	border-radius: 5px;
`;

export const TableContainer = styled.div`
	padding: 15px;
	width: 80%;
	@media screen and (max-width: 768px) {
		width: 100%;
		overflow: auto;
	}
`;

export const TableRow = styled.ul`
	padding: 0;
	width: 100%;
	list-style: none;
	display: flex;
	justify-content: space-between;
`;

export const TableHeader = styled(TableRow)`
	justify-content: start;
	font-weight: bold;
	color: #017cfe;
`;
export const HR = styled.hr`
	margin-top: 15px;
	height: 1.5px;
	background: #f0f0f0;
`;
export const TableCell = styled.li`
	display: flex;
	padding: 5px 10px;
	width: 25%;
	align-self: center;
	word-break: break-all;

	@media only screen and (max-width: 768px) {
		word-wrap: break-word;
		min-width: 60%;

		&:last-child {
			min-width: fit-content;
		}
	}
`;
