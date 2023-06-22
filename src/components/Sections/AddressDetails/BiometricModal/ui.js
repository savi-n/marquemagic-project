import styled from 'styled-components';

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const ResponsiveWrapper = styled.div`
	width: 100%;
`;
