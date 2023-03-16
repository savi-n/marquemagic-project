import styled from 'styled-components';

export const Wrapper = styled.div`
	/* padding-top: 50px; */
`;

export const SubSectionHeader = styled.h2`
	font-size: 1.5em;
	font-weight: 500;
`;

export const FormWrapGrid = styled.div`
	margin: 20px 0;
	display: grid;
	grid-gap: 25px 50px;
	grid-template-columns: repeat(2, 1fr);
	/* grid-auto-rows: 60px; */
	/* grid-auto-rows: min-content; */
	grid-auto-rows: minmax(60px, auto);
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
	padding-top: 20px;
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
	${({ borderColorCode }) => borderColorCode && `color: ${borderColorCode};`}
`;

export const Footer = styled.div`
	display: flex;
	gap: 20px;
`;

export const AddMoreWrapper = styled.div`
	display: flex;
	margin: 20px 0;
	align-items: center;
`;

export const RoundButton = styled.button`
	border-radius: 50%;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 17px;
	/* font-weight: 700; */
	background: ${({ theme }) => theme.buttonColor2};
	margin-right: 10px;
	@media (max-width: 700px) {
		height: auto;
		width: 2.25rem;
	}
`;

export const Accordian = styled.div`
	margin: 20px 0;
	display: flex;
	justify-content: space-between;
	box-shadow: rgba(11, 92, 255, 0.16) 0px 10px 36px 0px;
	height: 50px;
	align-items: center;
	padding: 0 20px;
`;
