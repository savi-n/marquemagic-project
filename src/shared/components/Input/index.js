import { Link } from 'react-router-dom';
import './style.scss';

export default function Input(props) {
	const { width, font, p, txtColor, classname } = props;
	return (
		<section className={`flex items-center ${!props.sideHead && 'justify-between'}`}>
			{props.type !== 'dropdown' && (
				<input
					{...props}
					className={`w-${width || ''} font-${font || '3xl'} p-${p || '4'} text-${txtColor ||
						'black'} border solid silver rounded focus:outline-none focus:shadow-inner shadow-sm ${classname}`}
					defaultValue={props.dv}
				/>
			)}
			{props.type === 'dropdown' && (
				<select
					className={`w-${width || ''} font-${font || '3xl'} p-${p || '4'} text-${txtColor ||
						'gray-400'} border solid silver rounded focus:outline-none focus:shadow-inner shadow-sm bg-transparent ${classname}`}
				>
					<option value={props.label} disabled>
						{props.label}
					</option>
					{props.data && props.data.map(item => <option value={item.value}>{item.value}</option>)}
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
		</section>
	);
}
