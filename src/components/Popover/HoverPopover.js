import React, { useState } from 'react';
// import './HoverPopover.css';
import styled from 'styled-components';
import iconImage from 'assets/icons/info-icon.png';

const HoverPopoverWrapper = styled.div`
	position: relative;
	display: inline-block;
	cursor: pointer;

	&:hover .popover {
		display: block;
	}
`;

const Popover = styled.div`
	display: none;
	position: absolute;
	background-color: rgba(0, 0, 0, 0.8);
	color: #fff;
	padding: 5px 10px;
	border-radius: 8px;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
`;

const ImgIcon = styled.img`
	width: 30px;
`;
const HoverPopover = ({ message }) => {
	const [showPopover, setShowPopover] = useState(false);

	return (
		<HoverPopoverWrapper
			className='hover-popover'
			onMouseEnter={() => setShowPopover(true)}
			onMouseLeave={() => setShowPopover(false)}
		>
			<ImgIcon src={iconImage} alt='info' />
			{showPopover && <Popover className='popover'>{message}</Popover>}
		</HoverPopoverWrapper>
	);
};

export default HoverPopover;
