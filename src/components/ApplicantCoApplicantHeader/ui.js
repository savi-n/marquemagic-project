import styled from 'styled-components';

export const Wrapper = styled.div`
	/* border: 1px solid red; */
	display: flex;
	height: 150px;
	/* padding: 0 50px; */
`;

export const UL = styled.ul`
	/* border: 1px solid gold; */
	display: flex;
	/* max-width: 90%; */
	/* max-width: 900px; */
	list-style-type: none;
	margin: 0;
	padding: 0;
	gap: 20px;
	height: 100%;
	text-align: center;
	overflow: auto;
`;

export const LI = styled.li`
	/* border: 1px solid yellow; */
	position: relative;
	height: 100%;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	/* gap: 10px; */
	min-width: 120px;
`;

export const Avatar = styled.img`
	/* border: dashed #0000ff80; */
	/* border-radius: 10px; */
	/* border-width: 2px; */
	height: 80px;
	width: 80px;
	border-radius: 50%;
	cursor: pointer;
	/* background-color: #dce2f7; */
`;

export const BadgeInvalid = styled.div`
	position: absolute;
	height: 12px;
	width: 12px;
	top: 0;
	margin-top: 30px;
	margin-left: 50px;
	background-color: #dc3545;
	border-radius: 25px;
`;

export const AvatarName = styled.h4``;

export const BadgeDelete = styled.img`
	position: absolute;
	height: 30px;
	right: 0;
	top: 0;
	margin-right: 20px;
	margin-top: 15px;
	cursor: pointer;
`;

export const IndecatorWrapper = styled.div`
	/* border: 1px solid purple; */
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 20px;
	min-width: 150px;
	/* background-color: grey; */
	gap: 20px;
`;

export const Indecator = styled.img`
	/* border: 1px solid gainsboro; */
	z-index: 1;
	height: 50px;
	width: 50px;
	cursor: pointer;
`;
