import { useState } from 'react';
import closeIcon from 'assets/icons/close_icon_grey.png';
import locationPinIcon from 'assets/icons/Geo_icon_5.png';
import * as UI from './ui';

function AddressDetailsCard(props) {
	const {
		setShowImageInfo,
		address = '',
		showCloseIcon = true,
		latitude,
		longitude,
		timestamp,
		embedInImageUpload = false,
		customStyle,
		err,
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
				{err ? (
					<UI.TextErr>{err}</UI.TextErr>
				) : (
					<>
						<UI.TextContent embedInImageUpload={embedInImageUpload}>
							{/*since we will be receiving address in a single string*/}
							{address?.length > stringLength && !displayCompleteAddress ? (
								<span>
									{address?.slice(0, stringLength)}
									<UI.FullAddress
										onClick={() => {
											setDisplayCompleteAddress(true);
										}}
									>
										...
									</UI.FullAddress>
								</span>
							) : (
								address
							)}
						</UI.TextContent>
						{latitude && (
							<>
								<UI.TextContent embedInImageUpload={embedInImageUpload}>
									Lat: {latitude} Long: {longitude}
								</UI.TextContent>
								<UI.TextContent embedInImageUpload={embedInImageUpload}>
									{timestamp}
								</UI.TextContent>
							</>
						)}
					</>
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
