import React from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import * as UI from './ui';

function AddressDetailsCard(props) {
	const {
		setShowImageInfo,
		city,
		address1,
		address2,
		state,
		pincode,
		imageSrc,
		showCloseIcon = true,
		coordinates,
	} = props;
	const stringLength = window.screen.width < 768 ? 30 : 80;
	return (
		<UI.ImageContent>
			<UI.TextIcon src={imageSrc} />
			<UI.ImageText>
				{/* {imageTextContent?.length > 130
					? imageTextContent?.slice(0, 130) + '...'
					: imageTextContent} */}
				<UI.TextHeader>{city}</UI.TextHeader>
				<UI.TextContent1>
					{address1?.length > stringLength
						? address1?.slice(0, stringLength) + '...'
						: address1}
				</UI.TextContent1>
				<UI.TextContent2>
					{address2?.length > stringLength
						? address2?.slice(0, stringLength) + '...'
						: address2}
				</UI.TextContent2>
				<UI.TextContent3>
					{state} {city} {pincode}
				</UI.TextContent3>
				<UI.LatLongTimestamp>
					{coordinates?.lat} {coordinates?.long} {coordinates?.timeStamp}
				</UI.LatLongTimestamp>
			</UI.ImageText>
			{showCloseIcon && (
				<UI.CloseIcon
					src={closeIcon}
					onClick={() => {
						setShowImageInfo(false);
					}}
				/>
			)}
		</UI.ImageContent>
	);
}

export default AddressDetailsCard;
