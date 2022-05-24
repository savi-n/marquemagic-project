// This component is used in 'src/components/Button' and
// also in 'src/pages/products/Products'

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
	margin-left: 48%;
	-webkit-animation: spin 2s linear infinite; /* Safari */
	animation: ${BounceAnimation} 2s linear infinite;
	@media (max-width: 700px) {
		margin: auto;
	}
`;

export default function Loader() {
	return <LoaderAnimation />;
}
