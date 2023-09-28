import styled from 'styled-components';

export const Button = styled.button`
	align-self: center;
	outline: none !important;
	padding: ${({ hasIcon }) => (hasIcon ? '12px 30px' : '14px 35px')};
	margin: 0 auto;
	border-radius: 999px;
	font-size: 20px;
	display: flex;
	align-items: center;
	background-color: white;
	border: solid 2px blue;

	@media (max-width: 768px) {
		padding: 5px 15px;
		font-size: 14px;
	}
	&:hover {
		background-color: #1414ad;
		cursor: pointer;
		color: white;
		-webkit-transition: background-color 1s ease-out;
		-moz-transition: background-color 1s ease-out;
		-o-transition: background-color 1s ease-out;
		transition: background-color 0.5s ease-out;
	}
`;

export const CustomerListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const ImgClose = styled.img`
	height: 25px;
	margin: 1rem;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const CustomerListCard = styled.div`
	display: flex;
	justify-content: space-between;
	border-radius: 14px;
	align-items: center;
	padding: 10px;
	background: #ffffff;
	box-shadow: 10px 10px 30px 3px rgba(11, 92, 255, 0.15);
	margin-bottom: 5px;
	cursor: pointer;
	background-color: ${({ isHeader }) => (isHeader ? '#eee' : 'white')};
	@media (max-width: 768px) {
		display: block;
	}
`;
export const CustomerListCardItem = styled.div`
	flex: 1;
	padding: 10px;
	text-align: center;
`;

export const Table = styled.table`
	border-collapse: collapse;
	width: 100%;
`;

export const TableHeader = styled.th`
	text-align: left;
	padding: 25px;
	background-color: #f2f2f2;
`;

export const TableRow = styled.tr`
	cursor: pointer;
	&:hover {
		background-color: #f2f2f2;
	}
`;

export const TableCell = styled.td`
	text-align: left;
	overflow-wrap: break-word;
	padding: 25px;
`;

export const ProgressBar = styled.div`
	width: 100%;
	background-color: #ccc;
	position: relative;
	height: 10px; /* Adjust the height for the thickness of the progress bar */
	border-radius: 5px; /* Makes it pill-shaped */
	overflow: hidden; /* Ensures the inner filler doesn't overflow */
`;
export const ProgressFiller = styled.div`
	width: ${props => props.percentage}%;
	height: 100%;
	background-color: green;
	border-radius: 5px; /* Maintains the pill shape */
`;
