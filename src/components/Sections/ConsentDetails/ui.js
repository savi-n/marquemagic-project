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
	font-size: 1.2rem;
	background-color: #f0f0f0;
	padding: 13px;
	border-radius: 5px;
	margin-bottom: 20px;
`;

export const TableContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 80%;
	@media screen and (max-width: 768px) {
		width: 100%;
	}
`;

export const TableRow = styled.div`
	display: flex;
	flex-direction: row;

	@media only screen and (max-width: 768px) {
		flex-wrap: wrap;
	}
`;

export const TableHeader = styled(TableRow)`
	font-weight: bolder;
	color: #017cfe;
`;

export const TableCell = styled.div`
	font-size: 1.1rem;
	align-self: center;
	flex-basis: 0;
	flex-grow: 1;
	padding: 0.5rem;

	@media only screen and (max-width: 768px) {
		word-wrap: break-word;
		width: 30%;
	}
`;
