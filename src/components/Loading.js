/* NC loader with animation */

import styled from 'styled-components';
import Lottie from 'lottie-react';

import NCLogo from '../shared/constants/NcLogo.json';

const Wrapper = styled.div`
	width: 70%;
	margin: 0 auto;
`;

export default function Loading(props) {
	const { width } = props;
	return (
		<Wrapper>
			<Lottie
				animationData={NCLogo}
				// options={{
				// 	animationData: NCLogo,
				// }}
				loop={true}
				width={width || '100%'}
			/>
		</Wrapper>
	);
}
