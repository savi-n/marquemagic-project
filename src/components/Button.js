import styled from 'styled-components';
import { string, func, object, oneOfType, bool } from 'prop-types';
import Loader from '../Branch/components/Loader';

const StyledButton = styled.button`
	color: ${({ theme, fill }) => (fill ? 'white' : theme.main_theme_color)};
	border: 2px solid
		${({ theme, fill }) =>
			fill && (typeof fill === 'string' ? fill : theme.main_theme_color)};
	border-radius: ${({ roundCorner }) => (roundCorner ? '40px' : '40px')};
	padding: 10px 20px;
	background: ${({ theme, fill }) =>
		fill && (typeof fill === 'string' ? fill : theme.main_theme_color)};
	display: flex;
	align-items: center;
	min-width: ${({ width }) => (width ? width : '200px')};
	justify-content: space-between;
	font-size: 0.9em;
	font-weight: 500;
	text-align: center;
	transition: 0.2s;
	display: flex;
	justify-content: center;
	position:relative;
	bottom: 4rem;
	&:hover {
		color: #fff;
		background: ${({ theme, fill }) => fill ?? theme.main_theme_color};
	}
`;

const Div = styled.div`
	text-align: center;
	flex: 1;
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
}) {
	return (
		<StyledButton
			onClick={onClick}
			fill={fill}
			disabled={disabled}
			altStyle={style}
			width={width}
			roundCorner={roundCorner}>
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
