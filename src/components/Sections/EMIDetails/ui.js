import styled from 'styled-components';

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
