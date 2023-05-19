/* This component is used to display the NC logo as Loader
 while the child component takes time to load.
 This prevents from a blank screen been shown to the user */

import styled, { keyframes } from 'styled-components';

const BounceAnimation = keyframes`
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
`;

const LoaderAnimation = styled.div`
	border: 2px solid #f3f3f3;
	border-radius: 50%;
	border-top: 2px solid #3498db;
	width: 20px;
	height: 20px;
	/* margin-left: 44%; */
	margin: 0 auto;
	-webkit-animation: spin 2s linear infinite; /* Safari */
	animation: ${BounceAnimation} 2s linear infinite;
	@media (max-width: 700px) {
		margin: auto;
	}
`;

export default function Loader() {
	return <LoaderAnimation />;
}
