/* NC loader with animation */

import styled from 'styled-components';
import Lottie from 'lottie-react';

import Circular from './Circular.json';

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`;

export default function CircularLoading() {
	return (
		<Wrapper>
			<Lottie
				options={{
					animationData: Circular,
				}}
				width={'100%'}
			/>
		</Wrapper>
	);
}
