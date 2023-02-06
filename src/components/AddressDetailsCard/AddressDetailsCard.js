import React from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import * as UI from './ui';
import locationPinIcon from 'assets/icons/edit-icon.png';

function AddressDetailsCard(props) {
	const {
		setShowImageInfo,
		city,
		address1,
		address2,
		state,
		pincode,
		// imageSrc,
		showCloseIcon = true,
		coordinates,
		embedInImageUpload = false,
		customStyle,
	} = props;
	const stringLength = window.screen.width < 768 ? 25 : 75;
	return (
		<UI.ImageContent
			style={customStyle}
			embedInImageUpload={embedInImageUpload}
		>
			<UI.TextIcon src={locationPinIcon} />
			<UI.ImageText>
				{/* {imageTextContent?.length > 130
					? imageTextContent?.slice(0, 130) + '...'
					: imageTextCont	ent} */}
				<UI.TextHeader>{city}</UI.TextHeader>
				<UI.TextContent1>
					{/* {address1?.length > stringLength
						? address1?.slice(0, stringLength) + '...'
						: address1} */}
					{address1}
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
					{coordinates?.lat} {coordinates?.long} {coordinates?.timestamp}
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
