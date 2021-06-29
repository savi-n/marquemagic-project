import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import './style.scss';

export default function Input(props) {
	const { width, font, p, txtColor, classname } = props;

	const customStyled = {
		control: () => ({
			height: '60px',
			padding: '1rem',
			borderRadius: '1.5rem',
			border: 'solid 1px silver',
			width: '22rem'
		})
	};

	return (
		<section className={`flex items-center ${!props.sideHead && 'justify-between'}`}>
			{props.type !== 'dropdown' && (
				<input
					{...props}
					className={`w-${width || ''} font-${font || ''} p-${p || '4'} px-6 text-${txtColor ||
						'black'} border border-gray-400 rounded-3xl focus:outline-none focus:shadow-inner shadow-sm ${classname &&
						classname}`}
				/>
			)}
			{/* {props.type === 'dropdown' && props.name !== 'productId' && (
				<select
					{...props}
					className={`w-${width || ''} font-${font || '3xl'} p-${p || '4'} text-${txtColor ||
						'gray-400'} border solid silver rounded-3xl focus:outline-none focus:shadow-inner shadow-sm bg-transparent ${classname}`}
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
			)} */}
			{props.type === 'dropdown' && (
				<Select
					className='select'
					{...props}
					styles={customStyled}
					options={props.options}
					closeOnSelect={true}
					{...props}
					value={props.defaultValue}
				/>
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
