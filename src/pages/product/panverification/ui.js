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

export const ExtractionErrorMessage = styled.p`
	margin-top: -100px;
	@media (max-width: 700px) {
		margin-top: -20px;
	}
`;

export const Wrapper = styled.div`
	flex: 1;
	padding: 50px;
	@media (max-width: 700px) {
		padding: 50px 0px;
		max-width: 100%;
	}
`;
export const LabRed = styled.h1`
	font-size: 1em;
	font-weight: 500;
	color: red;
	margin-top: -25px;
`;

export const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 50%;
	@media (max-width: 700px) {
		width: 100%;
	}
`;
export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
export const FieldWrapperPanVerify = styled.div`
	padding: 30px 10px;
	/* width: 50%; */
	place-self: center;

	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const ConfirmPanWrapper = styled.div`
	padding: 40px 0;
	margin-right: auto;
	margin-left: auto;
	text-align: center;
`;

export const H2 = styled.h2`
	width: 50%;
	text-align: center;
	font-weight: 500;
`;

export const CardRadioButton = styled.div`
	/* box-shadow: 0 4px 9px 0 #bdd2ef; */
	box-shadow: rgb(11 92 255 / 16%) 0px 2px 5px 1px;
	width: 180px;
	height: 45px;
	line-height: 45px;
	margin-right: 20px;
	padding-left: 20px;
	border-radius: 6px;
	text-align: left;
	input {
		cursor: pointer;
	}
	label {
		padding-left: 15px;
		cursor: pointer;
	}
	@media (max-width: 700px) {
		margin-bottom: 15px;
	}
`;

export const RadioButtonWrapper = styled.div`
	padding: 30px 0;
	display: flex;
	@media (max-width: 700px) {
		display: inline-block;
	}
`;

export const ButtonWrapper = styled.div`
	margin-top: 20px;
`;

export const NotificationImg = styled.img`
	margin-right: 8px;
	width: 33px;
	display: inline-block;
`;
