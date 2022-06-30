import styled from 'styled-components';

export const SkipAadhaarWrapper = styled.div`
	min-height: 30px;
	width: 100%;
	/* border: 1px solid red; */
	display: flex;
	align-items: center;
	label {
		margin-left: 10px;
	}
	${({ isInActive }) =>
		isInActive &&
		`
		color: lightgrey;
		cursor: not-allowed;
		`}
`;

export const DisabledCheckbox = styled.div`
	min-height: 15px;
	min-width: 15px;
	max-height: 15px;
	max-width: 15px;
	background-color: lightgrey;
`;

export const DocTypeChangeModalBody = styled.div`
	text-align: center;
	padding: 20px;
`;

export const DocTypeChangeModalHeader = styled.div`
	/* text-align: left; */
`;
export const DocTypeChangeModalFooter = styled.div`
	margin-top: 30px;
	display: flex;
	justify-content: center;
	gap: 20px;
`;
