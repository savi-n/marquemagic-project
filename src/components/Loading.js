/* NC loader with animation */

import styled from 'styled-components';
import Lottie from 'lottie-react';

import NCLogo from '../shared/constants/NcLogo.json';

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`;

export default function Loading() {
	return (
		<Wrapper>
			<Lottie
				animationData={NCLogo}
				// options={{
				// 	animationData: NCLogo,
				// }}
				width={'100%'}
			/>
		</Wrapper>
	);
}
