import styled from 'styled-components';

export const ProfilePicWrapper = styled.div`
	margin-bottom: 10px;
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
