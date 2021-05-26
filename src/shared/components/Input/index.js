import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default function Input(props) {
	const { width } = props;
	return (
		<section className='flex items-center justify-between'>
			<input
				{...props}
				className={`${
					width ? width : ''
				} font-3xl p-3 text-black border solid silver rounded focus:outline-none focus:shadow-inner`}
			/>
			{props.link && (
				<Link
					className={`px-4 text-${props.linkColor}-600 hover:text-${props.linkColor}-400`}
					to={props.link.to}
				>
					{props.link.name}
				</Link>
			)}
		</section>
	);
}
