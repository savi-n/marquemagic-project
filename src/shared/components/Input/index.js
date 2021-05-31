import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

export default function Input(props) {
	const { width, font, p, txtColor, classname } = props;
	const aes = () => {
		const data = document.querySelectorAll(`${props.type === 'dropdown' ? 'select' : 'input'}`);
		data.forEach((el, idx) => {
			var h = el.getAttribute('placeholder');
			if (el.getAttribute('t') === '1') {
				el.setAttribute('placeholder', h + ' *');
				return;
			}
		});
	};
	useEffect(() => {
		aes();
	}, []);

	return (
		<section className={`flex items-center ${!props.sideHead && 'justify-between'}`}>
			{props.type !== 'dropdown' && (
				<input
					{...props}
					className={`w-${width || ''} font-${font || '3xl'} p-${p || '4'} text-${txtColor ||
						'black'} border solid silver rounded-xl focus:outline-none focus:shadow-inner shadow-sm ${classname &&
						classname}`}
				/>
			)}
			{props.type === 'dropdown' && (
				<select
					{...props}
					className={`w-${width || ''} font-${font || '3xl'} p-${p || '4'} text-${txtColor ||
						'gray-400'} border solid silver rounded-xl focus:outline-none focus:shadow-inner shadow-sm bg-transparent ${classname}`}
				>
					{props.label && (
						<option value={props.label} selected disabled>
							{props.label}
						</option>
					)}
					{props.data &&
						props.data.map(item => (
							<option value={item.value ? item.value : item.accNum}>
								{item.value ? item.value : item.accNum}
							</option>
						))}
				</select>
			)}
			{((props.link || props.sideHead) &&
				(props.link && (
					<section className='relative -left-40'>
						<Link
							className={`px-5 text-${props.linkColor}-600 hover:text-${props.linkColor}-400`}
							to={props.link.to}
						>
							{props.link.name}
						</Link>
					</section>
				))) ||
				(props.sideHead && <p className='px-4 font-semibold'>{props.sideHead}</p>)}
			{aes()}
		</section>
	);
}
