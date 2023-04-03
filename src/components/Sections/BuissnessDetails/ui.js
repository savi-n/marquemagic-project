import styled from 'styled-components';

export const SubSectionCustomHeader = styled.div`
	display: flex;
	justify-content: space-between;
	input,
	label {
		cursor: pointer;
	}
`;
export const HeaderWrapper = styled.div`
	display: flex;
	align-items: flex-end;
	@media (max-width: 768px) {
		display: block;
	}
`;

export const HeaderTitle = styled.h1`
	margin-right: 15px;
	font-size: 30px;
	font-weight: 400;
`;

export const Tip = styled.span`
	font-size: 18px;
	font-weight: 400;
`;

export const CheckboxSameAs = styled.input`
	margin-right: 10px;
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
		padding-left: 10px;
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
export const OR = styled.div`
	/* border: 1px solid red; */
	z-index: 0;
	position: absolute;
	width: 100%;
	text-align: center;
	height: 50px;
	line-height: 50px;
	@media (max-width: 700px) {
		margin-top: 50px;
	}
`;

export const ProfilePicWrapper = styled.div`
	margin-bottom: 10px;
`;

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;
