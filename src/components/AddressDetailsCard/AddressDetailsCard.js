import React from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import * as UI from './ui';
import locationPinIcon from 'assets/icons/Geo_icon_5.png';
import { useState } from 'react';

function AddressDetailsCard(props) {
	const {
		setShowImageInfo,
		city,
		address1,
		state,
		pincode,
		// imageSrc,
		showCloseIcon = true,
		coordinates,
		embedInImageUpload = false,
		customStyle,
	} = props;
	const stringLength = window.screen.width < 768 ? 25 : 75;
	const [displayCompleteAddress, setDisplayCompleteAddress] = useState(false);
	return (
		<UI.ImageContent
			style={customStyle}
			embedInImageUpload={embedInImageUpload}
			displayCompleteAddress={displayCompleteAddress}
		>
			<UI.TextIcon src={locationPinIcon} />
			<UI.ImageText>
				<UI.TextHeader>{city}</UI.TextHeader>
				<UI.TextContent1>
					{/*since we will be receiving address in a signle string*/}
					{address1?.length > stringLength && !displayCompleteAddress ? (
						<p>
							{address1?.slice(0, stringLength)}
							<UI.FullAddress
								onClick={() => {
									setDisplayCompleteAddress(true);
								}}
							>
								...
							</UI.FullAddress>
						</p>
					) : (
						address1
					)}
				</UI.TextContent1>
				<UI.TextContent2>
					{state} {city} {pincode}
				</UI.TextContent2>
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
