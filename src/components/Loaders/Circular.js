/* NC loader with animation */

import styled from 'styled-components';
import Lottie from 'lottie-react';

import Circular from './Circular.json';

const Wrapper = styled.div`
	width: 50px;
	height: 50px;
`;

export default function CircularLoading(props) {
	const { height, width } = props;
	return (
		<Wrapper>
			<Lottie
				animationData={Circular}
				// options={{
				// 	animationData: Circular,
				// }}
				height={height || '50px'}
				width={width || '50px'}
			/>
		</Wrapper>
	);
}
