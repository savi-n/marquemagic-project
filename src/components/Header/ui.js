import styled from 'styled-components';

export const Wrapper = styled.div`
	/* border: 1px solid red; */
	display: flex;
	align-items: center;
	gap: 20px;
	height: 100%;
	padding: 0 50px;
	@media (max-width: 700px) {
		padding: 0 20px;
		justify-content: center;
	}
`;

export const LogoLink = styled.a``;

export const Logo = styled.img`
	/* width: 200px; */
	width: 100%;
	height: 50px;
	/* height: calc(100% - 40px); */
	object-fit: scale-down;
	object-position: left;
	@media (max-width: 700px) {
		/* padding: 0px 50px; */
		/* width: 100%; */
	}
`;

export const ButtonBackToDashboardWrapper = styled.div`
	font-size: 12px;
	margin-left: auto;
	min-width: 100px;
`;
