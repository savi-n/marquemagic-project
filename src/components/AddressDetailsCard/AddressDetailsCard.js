import React from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import * as UI from './ui';
import locationPinIcon from 'assets/icons/edit-icon.png';

function AddressDetailsCard(props) {
	const {
		setShowImageInfo,
		city,
		address,
		showCloseIcon = true,
		latitude,
		longitude,
		timestamp,
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
				<UI.TextContent>{address}</UI.TextContent>

				{latitude && (
					<UI.TextContent>
						Lat: {latitude} Long: {longitude}{' '}
					</UI.TextContent>
				)}
				<UI.TextContent>{timestamp}</UI.TextContent>
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
