import styled from 'styled-components';

const TooltipContainer = styled.div`
	position: relative;
	display: inline-block;
`;

const TooltipText = styled.span`
	visibility: hidden;
	width: 120px;
	height: 75px;
	background-color: #333;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px;
	position: absolute;
	z-index: 1;
	bottom: 125%;
	left: 50%;
	transform: translateX(-50%);
	opacity: 0;
	transition: opacity 0.1s;
`;

const Image = styled.img`
	width: 20px;
	height: 20px;
	margin-left: 4px;
`;

const TooltipImage = ({ src, alt, title }) => {
	return (
		<TooltipContainer>
			<Image src={src} alt={alt} title={title} />
			<TooltipText>{title}</TooltipText>
		</TooltipContainer>
	);
};

export default TooltipImage;
