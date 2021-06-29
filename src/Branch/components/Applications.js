import { useEffect, useState } from 'react';
import './styles/index.scss';
import Tabs from '../shared/components/Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CardDetails from '../shared/components/CardDetails';
import { getCase } from '../utils/requests';
import Loading from '../../components/Loading';

export default function Applications({ d, sortList, setLActive, lActive, getTabData, isIdentifier }) {
	const [data, setData] = useState(null);

	const mapp = {
		'Pending Applications': 'Pending Applications',
		'In-Progress@NC': 'NC In-Progress',
		'Branch Review': 'Branch Review',
		'In-Progress@AO': 'In-Progress At AO',
		Sanctioned: 'Sanctioned',
		Rejected: 'Rejected'
	};

	const [loading, setLoading] = useState(false);

	useEffect(async () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			if (e === lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
				});
			}
		});
	}, []);

	const getTabs = item => (
		<Tabs
			length={data && data.length}
			k={item.label}
			active={lActive === item.label}
			click={setLActive}
			align='vertical'
			lActive={lActive}
			setData={setData}
			setLoading={setLoading}
		/>
	);

	return (
		<section className='flex'>
			<section
				style={{
					overflow: 'scroll',
					maxHeight: 'calc(100vh - 5.8rem)',
					height: 'calc(100vh - 5.8rem)',
					paddingLeft: '2rem'
				}}
				className='scroll absolute bg-blue-700 w-1/5 py-16 flex flex-col gap-y-8 bottom-0'
			>
				<span className='text-white font-medium text-xl pl-8'>Loan Applications</span>
				<section>
					{d.map((item, idx) =>
						isIdentifier() ? item.label !== 'Branch Review' && getTabs(item) : getTabs(item)
					)}
				</section>
			</section>
			<section
				className='absolute right-0 px-24 scroll'
				style={{
					width: '100%',
					maxWidth: 'calc(100vw - 20%)',
					maxHeight: 'calc(100vh)',
					overflow: 'scroll'
				}}
			>
				<section className='top-24 w-full absolute flex justify-between gap-x-10 items-center'>
					<section className='w-1/2 flex items-center mt-10'>
						<input
							className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none  rounded-l-full'
							placeholder='Search application name, loan type, loan amount'
						/>
						<FontAwesomeIcon
							className='h-12 rounded-r-full cursor-pointer bg-blue-100 text-indigo-700 text-5xl px-4 p-2'
							icon={faSearch}
						/>
					</section>
					<section className='flex w-1/3 gap-x-4 mt-10 items-center'>
						<span className='w-16'>Sort by</span>
						<div className='select_box w-full'>
							<select className='dropdown focus:outline-none bg-transparent'>
								{sortList.map(el => (
									<option>{el}</option>
								))}
							</select>
						</div>
					</section>
				</section>
				<section className='w-full gap-20 flex grid grid-cols-2 pb-10' style={{ paddingTop: '16em' }}>
					{loading && <Loading />}
					{data && data.length
						? data.map(item => <CardDetails label={lActive} full={true} item={item} lActive={lActive} />)
						: !loading && <span className='text-start w-full opacity-50'>No Applications</span>}
				</section>
			</section>
		</section>
	);
}
