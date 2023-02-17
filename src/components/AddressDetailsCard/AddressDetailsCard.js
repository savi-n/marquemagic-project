import React from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import * as UI from './ui';
import locationPinIcon from 'assets/icons/Geo_icon_5.png';
import { useState } from 'react';

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
	const [displayCompleteAddress, setDisplayCompleteAddress] = useState(false);
	return (
		<UI.ImageContent
			style={customStyle}
			embedInImageUpload={embedInImageUpload}
			displayCompleteAddress={displayCompleteAddress}
		>
			<UI.TextIcon src={locationPinIcon} />
			<UI.ImageText>
				<UI.TextContent>
					{/*since we will be receiving address in a signle string*/}
					{address?.length > stringLength && !displayCompleteAddress ? (
						<p>
							{address?.slice(0, stringLength)}
							<UI.FullAddress
								onClick={() => {
									setDisplayCompleteAddress(true);
								}}
							>
								...
							</UI.FullAddress>
						</p>
					) : (
						address
					)}
				</UI.TextContent>
				{latitude && (
					<UI.TextContent>
						Lat: {latitude} Long: {longitude} {timestamp}
					</UI.TextContent>
				)}
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
