import styled from 'styled-components';

export const Wrapper = styled.div``;

export const GreenTickImage = styled.img`
	height: 20px;
	z-index: 100;
	position: absolute;
	right: 200px;
	@media (max-width: 768px) {
		right: 50px;
		margin-top: 15px;
	}
`;

export const AadhaarFieldWrapper = styled.div`
	display: flex;
	gap: 10px;
	align-items: center;
`;
