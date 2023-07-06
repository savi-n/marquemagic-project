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
	@media (max-width: 768px) {
		font-size: 14px;
	}
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
	width: 100%;
	@media (max-width: 768px) {
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
	flex-direction: column;
	padding: 5px 10px;
	width: 25%;
	align-self: flex-start;
	/* word-break: break-all; */
	overflow-wrap: break-word;

	@media (max-width: 768px) {
		word-wrap: break-word;
		min-width: 50%;

		&:last-child {
			min-width: fit-content;
		}
	}
`;

export const Buttons = styled.div`
	display: flex;
	gap: 1rem;
`;

export const Disclaimer = styled.div`
	font-size: 10px;
`;
