import React from 'react';
import Lottie from 'react-lottie';

import NCLogo from '../../constants/NcLogo.json';

export default function NCLoader(props) {
	return (
		<Lottie
			options={{
				animationData: NCLogo
			}}
			width={500}
		/>
	);
}
