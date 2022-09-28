/* NC loader with animation */
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Lottie from 'lottie-react';

import DefaultLogo from 'shared/constants/generic_loader_1.json';
//import NcLogo from '../shared/constants/NcLogo.json';

const Wrapper = styled.div`
	width: 70%;
	margin: 0 auto;
`;

//import loader1 from loaderPermission;

export default function Loading(props) {
	const [loaders, setLoaders] = useState(DefaultLogo);

	useEffect(() => {
		let loaderPermission = DefaultLogo;
		try {
			loaderPermission =
				JSON.parse(sessionStorage.getItem('permission'))?.color_theme_react
					?.loader_json || DefaultLogo;
			if (typeof loaderPermission === 'string') {
				fetch(loaderPermission)
					.then(response => response.json())
					.then(json => setLoaders(json));
			}
		} catch (error) {
			console.error('Loading-loaderpermission-', error);
		}
		// eslint-disable-next-line
	}, []);

	const { width } = props;

	return (
		<Wrapper>
			<Lottie
				animationData={loaders}
				// options={{
				// 	animationData: NCLogo,
				// }}
				loop={true}
				width={width || '100%'}
			/>
		</Wrapper>
	);
}
