import { getCase } from '../../utils/requests';

export default function Tabs(props) {
	const { active, align, k, click, text, length, setData, setLoading } = props;

	const mapp = {
		'Pending Applications': 'Pending Applications',
		'In-Progress@NC': 'NC In-Progress',
		'Branch Review': 'Branch Review',
		'In-Progress@AO': 'In-Progress At AO',
		Sanctioned: 'Sanctioned',
		Rejected: 'Rejected'
	};

	const e = async (k, w) => {
		align !== 'horizontal' && setLoading(true);
		align !== 'horizontal' && setData(null);
		const s = w.target.textContent.split(length && length.toString())[0];
		Object.keys(mapp).map(async e => {
			if (e === s && align !== 'horizontal') {
				setData(await getCase(mapp[e]));
				setLoading(false);
			}
		});
		click(k);
	};

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
					className={`${
						align !== 'horizontal' ? 'p-4 px-8 h-full rounded-l-full justify-between' : 'p-2'
					} ${active && align !== 'horizontal' && 'bg-indigo-500'}`}
					onClick={w => e(k, w)}
				>
					{k}
					{/* {length !== undefined && length !== null && (
						<span className='bg-indigo-400 px-3 py-1 rounded-full'>{length}</span>
					)} */}
				</span>
			</section>
		</section>
	);
}
