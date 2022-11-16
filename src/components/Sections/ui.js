import styled from 'styled-components';

export const Wrapper = styled.div``;

export const SubSectionHeader = styled.h2`
	font-size: 1.5em;
	font-weight: 500;
`;

export const FormWrap = styled.div`
	position: relative;
	display: flex;
	/* align-items: center; */
	flex-wrap: wrap;
	gap: 10%;
	margin: 20px 0;
	justify-content: space-between;
	/* flex-flow: wrap column; */
	/* max-height: 400px; */
`;

export const FieldWrap = styled.div`
	width: ${({ isSmallSize }) => (isSmallSize ? '25%' : '45%')};
	/* width: 25%; */
	display: ${({ isSubFields }) => (isSubFields ? 'flex' : 'block')};
	gap: ${({ isSubFields }) => (isSubFields ? '10px' : '0')};
	margin: 15px 0;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const ErrorMessageSubFields = styled.div`
	position: absolute;
	width: 45%;
	margin-top: 50px;
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;
export const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

export const Footer = styled.div`
	display: flex;
	gap: 20px;
`;
