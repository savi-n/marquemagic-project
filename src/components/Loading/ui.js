import styled from 'styled-components';

export const LoaderCircle = styled.label`
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(15px);
	margin: 0 auto;
	&:before {
		content: '';
		border: 4px solid #e2e1e1;
		border-bottom-color: #4750cf;
		border-radius: 50%;
		width: 25px;
		height: 25px;
		animation: rotating 2s linear infinite;
	}

	@keyframes rotating {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
`;
