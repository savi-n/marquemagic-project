import styled from 'styled-components';
import imgSideNav from 'assets/images/bg/Left-Nav_BG.png';

export const Wrapper = styled.div`
	width: 100%;
	min-height: 100%;
	display: flex;
`;

/* background: ${({ theme }) => theme.main_theme_color}; */
export const Colom1 = styled.div`
	background-image: url(${imgSideNav});
	background-size: cover;
	background-position-y: -120px;
	min-height: 100% !important;
	width: 22%;
	color: #fff;
	padding: 50px 20px;
	position: relative;
	@media (max-width: 700px) {
		width: ${({ hide }) => (hide ? '0px' : '300px')};
		padding: ${({ hide }) => (hide ? '0px' : '50px 20px')};
		position: fixed;
		height: 100%;
		z-index: 9999;
	}
`;

export const Colom2 = styled.div`
	border: 1px solid green;
	flex: 1;
	background: #fff;
	display: flex;
	overflow: scroll;
	&::-webkit-scrollbar {
		display: none;
	}
	@media (max-width: 700px) {
		/* z-index: 2; */
		padding: 0 50px;
	}
`;

/* border: ${({ active }) => (active ? '1px solid' : 'none')}; */
export const Menu = styled.h5`
	background: ${({ active }) =>
		active ? 'linear-gradient(to right, #2a2add , #00df8d)' : 'none'};
	box-shadow: ${({ active }) =>
		active ? 'rgba(0, 0, 0, 0.24) 0px 3px 8px' : 'none'};
	width: 112%;
	border-radius: 5px;
	padding: 10px 20px;
	margin: 5px 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
	div {
		/* border: 1px solid white; */
		/* min-width: 150px; */
	}
	@media (max-width: 700px) {
		padding: ${({ hide }) => (hide ? '0px 0px' : '5px 10px')};
		display: ${({ hide }) => hide && 'none'};
		width: 100%;
	}
`;

export const ImgArrorRight = styled.img`
	/* border: 1px solid white; */
	height: 15px;
	padding-right: 10px;
`;

export const ImgCheckCircle = styled.img`
	/* border: 1px solid white; */
	height: 20px;
	padding-right: 20px;
	/* margin-right: ${({ active }) => (active ? '-65px' : '0')}; */
`;

export const Link = styled.div`
	/* border: 1px solid white; */
	/* cursor: pointer; */
`;
export const HeadingBox = styled.div`
	cursor: pointer;
	display: flex;
	margin-bottom: 20px;
`;
export const ScrollBox = styled.div`
	::-webkit-scrollbar {
		width: 0px;
	}
	::-webkit-scrollbar-track-piece {
		background-color: transparent;
		border-radius: 6px;
		-webkit-border-radius: 6px;
	}
	@media (max-width: 700px) {
		height: 70vh;
		overflow-y: scroll;
		overflow-x: hidden;
	}
`;
export const ProductName = styled.h5`
	border: ${({ active }) => (active ? '1px solid' : 'none')};
	font-size: 18px;
	font-weight: bold;
	padding-left: 10px;
	line-height: 30px;
	margin: 0;
	display: flex;
	flex-direction: column;
	cursor: auto;

	@media (max-width: 700px) {
		display: ${({ hide }) => hide && 'none'};
	}
`;

export const ApplicationNo = styled.span`
	color: lightgray;
	font-size: 14px;
`;

export const BackButton = styled.img`
	height: 30px;
`;

export const IconDottedRight = styled.img`
	position: absolute;
	height: 30px;
	right: 0;
	margin-top: 40px;
	margin-right: 30px;
`;

export const SectionSidebarArrow = styled.section`
	z-index: 100;
	display: none;
	@media (max-width: 700px) {
		display: block;
	}
`;
export const ArrowShow = styled.div`
	width: min-content;
	margin-left: ${({ hide }) => (hide ? '0px' : '300px')};
	position: fixed;
`;

export const SectionDevider = styled.div`
	border-bottom: 1px solid white;
	margin: 20px 0;
`;
