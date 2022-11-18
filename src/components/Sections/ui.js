import styled from 'styled-components';

export const Wrapper = styled.div``;

export const SubSectionHeader = styled.h2`
	font-size: 1.5em;
	font-weight: 500;
`;

export const FormWrapGrid = styled.div`
	margin: 20px 0;
	display: grid;
	grid-gap: 25px 50px;
	grid-template-columns: repeat(2, 1fr);
	grid-auto-rows: 60px;
	grid-auto-flow: dense;
	position: relative;
	@media (max-width: 700px) {
		grid-template-columns: repeat(1, 1fr);
	}
`;

export const FieldWrapGrid = styled.div`
	width: 100%;
	${({ isSubFields }) =>
		isSubFields &&
		`
		display: flex;
		justify-content: space-between;
		gap: 20px;
	`}
	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const FormWrap = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10%;
	margin: 20px 0;
	justify-content: space-between;
	@media (max-width: 700px) {
		grid-template-columns: repeat(1, 1fr);
	}
`;

export const FieldWrap = styled.div`
	width: ${({ isSmallSize }) => (isSmallSize ? '25%' : '45%')};
	display: ${({ isSubFields }) => (isSubFields ? 'flex' : 'block')};
	gap: ${({ isSubFields }) => (isSubFields ? '10px' : '0')};
	margin: 15px 0;
	height: 60px;

	display: grid;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const ErrorMessageSubFields = styled.div`
	position: absolute;
	width: 45%;
	margin-top: 50px;
	color: red;
	text-align: left;
	font-size: 12px;
	font-weight: 500;
`;
export const ErrorMessage = styled.div`
	color: red;
	text-align: left;
	padding-left: 4px;
	padding-top: 2px;
	font-size: 12px;
	font-weight: 500;
`;

export const Footer = styled.div`
	display: flex;
	gap: 20px;
`;
