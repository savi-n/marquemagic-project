import { getCase } from '../../utils/requests';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function Tabs(props) {
	const {
		active,
		align,
		k,
		click,
		text,
		length,
		setData,
		setLoading,
		check,
		handleDisable,
		disabled,
		setNoRecord
	} = props;

	const mapp = {
		'Pending Applications': 'Pending Applications',
		'In-Progress@NC': 'NC In-Progress',
		'Branch Review': 'Branch Review',
		'In-Progress@AO': 'In-Progress At AO',
		Sanctioned: 'Sanctioned',
		Rejected: 'Rejected'
	};

	const e = async (k, w) => {
		if (!check) {
			align !== 'horizontal' && setLoading(true);
			align !== 'horizontal' && setData(null);
			const s = w.target.textContent.split(length && length.toString())[0];
			Object.keys(mapp).map(async e => {
				if (e === s && align !== 'horizontal') {
					setData(await getCase(mapp[e]));
					setLoading(false);
				}
			});
		}
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
					paddingRight: `${!check ? '0' : '0.5rem'}`,
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
						align !== 'horizontal' && !check
							? 'p-4 px-8 h-full rounded-l-full justify-between'
							: !check && 'p-2'
					} ${active && align !== 'horizontal' && 'bg-indigo-500'} ${check && 'rounded-l-lg px-4'}`}
					onClick={w => e(k, w)}
				>
					{k}
					{/* {length !== undefined && length !== null && (
						<span className='bg-indigo-400 px-3 py-1 rounded-full'>{length}</span>
					)} */}
				</span>
				{check && (
					<span
						style={{
							padding: '1.5rem',
							color: 'white',
							display: 'flex',
							alignItems: 'center'
						}}
						className={`${active && 'bg-indigo-500 rounded-r-lg'}`}
					>
						<FontAwesomeIcon icon={disabled ? faEdit : faCheck} onClick={() => handleDisable(!disabled)} />
					</span>
				)}
			</section>
		</section>
	);
}
