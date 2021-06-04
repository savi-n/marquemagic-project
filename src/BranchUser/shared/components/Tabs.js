export default function Tabs(props) {
	const { active, align, k, click, text } = props;

	return (
		<section style={{ display: 'flex', alignItems: 'center' }}>
			<section
				style={{
					fontSize: `1.1rem`,
					display: 'flex',
					flex: `${align === 'horizontal' ? 'row' : 'col'}`,
					justifyContent: 'flex-end',
					cursor: 'pointer',
					paddingRight: '0',
					width: `${align !== 'horizontal' && '20rem'}`
				}}
				className={`${align !== 'horizontal' ? 'py-4' : 'p-6'}`}
			>
				<span
					style={{
						borderBottom: `${active ? `solid 2px ${text}` : ''}`,
						color: `${align === 'horizontal' ? text : 'white'}`,
						width: '100%',
						display: 'flex',
						alignItems: 'center'
					}}
					className={`${align !== 'horizontal' ? 'p-4 px-8 h-full rounded-l-full' : 'p-2'} ${active &&
						align !== 'horizontal' &&
						'bg-indigo-500'}`}
					onClick={e => click(k)}
				>
					{k}
				</span>
			</section>
		</section>
	);
}
