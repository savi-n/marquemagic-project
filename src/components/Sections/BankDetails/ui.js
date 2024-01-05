import styled from 'styled-components';

export const ModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 300px;
	padding: 0 40px;
`;

export const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
	gap: 40px;
`;

export const MessageSection = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 20px;
`;

export const MessageIcon = styled.span`
	margin-right: 5px;
`;

export const SuccessMessage = styled.span`
	color: #4cc97f;
	font-size: 1.2rem;
	font-weight: bold;
`;

export const FailureMessage = styled.span`
	color: #f7941d;
	font-size: 1.2rem;
	font-weight: bold;
`;

export const DataTable = styled.table`
	width: 100%;
	margin-top: 20px;
	border-collapse: collapse;
`;

export const TableHeader = styled.th`
	background-color: #f2f2f2;
	border: 1px solid #ddd;
	padding: 8px;
	text-align: left;
`;

export const TableCell = styled.td`
	border: 1px solid #ddd;
	padding: 8px;
`;

export const StatusIcon = styled.img`
	height: 30px;
	width: 30px;
`;
