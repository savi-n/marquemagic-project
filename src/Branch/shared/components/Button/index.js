import { Link } from 'react-router-dom';
import Proptypes from 'prop-types';
import './style.scoped.scss';

export default function Button(props) {
	const { type, size, width, rounded, to, children, onClick, disabled } = props;
	return (
		<main className={`${type} ${size} ${width} ${rounded} inline-flex items-center select-none`}>
			{to ? (
				<button
					disabled={disabled}
					className='focus:outline-none flex justify-center items-center'
					onClick={onClick}
				>
					{children}
				</button>
			) : (
				<Link to={to}>{children}</Link>
			)}
		</main>
	);
}

Button.propTypes = {
	to: Proptypes.string,
	size: Proptypes.oneOf(['small', 'basic', 'large']),
	rounded: Proptypes.oneOf(['rsm', 'rbase', 'rlg', 'rfull']),
	type: Proptypes.oneOf([
		'blue',
		'blue-light',
		'blue-link',
		'green',
		'green-light',
		'green-link',
		'red',
		'red-light',
		'red-link',
		'yellow',
		'yellow-light',
		'yellow-link',
		'gray',
		'gray-light',
		'gray-link',
		'white',
		'white-gray',
		'white-blue'
	]),
	width: Proptypes.oneOf(['autoo', 'fulll'])
};

Button.defaultProps = {
	to: '#',
	size: 'basic',
	rounded: 'rbase',
	type: 'white',
	width: 'autoo'
};
