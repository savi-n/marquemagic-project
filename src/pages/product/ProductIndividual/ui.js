import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	min-height: 100%;
	display: flex;
`;

export const RightSectionWrapper = styled.div`
	/* border: 1px solid green; */
	flex: 1;
	background: #fff;
	display: flex;
	overflow: scroll;
	padding-bottom: 50px;
	&::-webkit-scrollbar {
		display: none;
	}
	@media (max-width: 700px) {
		/* z-index: 2; */
		padding: 0 50px;
	}
`;

export const DynamicSectionWrapper = styled.div`
	/* border: 1px solid purple; */
	width: 100%;
	padding: 0px 50px;
`;

export const DynamicSubSectionWrapper = styled.div`
	/* border: 1px solid black; */
	/* margin-top: 30px; */
`;

export const IconDottedRight = styled.img`
	position: absolute;
	height: 30px;
	right: 0;
	margin-top: 40px;
	margin-right: 30px;
`;
