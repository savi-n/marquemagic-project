/* Here styled button is defined so that button layout is same throughout the application */

import styled from 'styled-components';
import { string, func, object, oneOfType, bool } from 'prop-types';
import Loader from '../Branch/components/Loader';

const StyledButton = styled.button`
	color: ${({ theme, fillColor }) =>
		fillColor ? 'white' : theme.main_theme_color};
	border: 2px solid
		${({ theme, fillColor }) =>
			fillColor &&
			(typeof fillColor === 'string' ? fillColor : theme.main_theme_color)};
	border-radius: ${({ roundCorner }) => (roundCorner ? '40px' : '5px')};
	padding: 10px 20px;
	background: ${({ theme, fillColor }) =>
		fillColor && (typeof fillColor === 'string' ? '' : '#1414ad')};

align-items: flex-start;
	/* min-width: ${({ width }) => (width ? width : '200px')}; */
	width: 200px;
	font-size: 0.9em;
	font-weight: 500;
	text-align: center;
	transition: 0.2s;
	justify-content: center;
	border-radius: 40px;
	@media (max-width: 700px) {
		padding: 10px;
		border-radius: ${({ roundCorner }) => (roundCorner ? '40px' : '0')};
		border: 2px solid #1414ad;
		width: ${({ roundCorner }) => (roundCorner ? '200px' : 'auto')};
	}

	&:hover {
		color: #fff;
		background: ${({ theme, fill }) => fill ?? theme.main_theme_color};
	}
`;

const Div = styled.div`
	text-align: center;
	flex: 1;
	position: relative;
`;

const LoaderCircle = styled.label`
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
		width: 20px;
		height: 20px;
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

export default function Button({
	name,
	onClick,
	children,
	fill,
	style,
	disabled = false,
	width,
	roundCorner = false,
	isLoader,
	loading,
	customStyle = {},
	type,
}) {
	return (
		<StyledButton
			type={type || 'submit'}
			onClick={onClick}
			disabled={disabled}
			altStyle={style}
			width={width}
			roundCorner={roundCorner}
			style={customStyle}
			fillColor={fill}
			text
		>
			{isLoader ? <Loader /> : name && !loading && <Div>{name}</Div>}
			{loading && <LoaderCircle />}
			{!loading && children}
		</StyledButton>
	);
}

Button.defaultProps = {
	name: '',
	onClick: () => {},
	children: '',
	fill: null,
	style: {},
};

Button.propTypes = {
	name: string.isRequired,
	onClick: func,
	fill: oneOfType([bool, string]),
	style: object,
};
