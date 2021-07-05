import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './styles/index.scss';
import Tabs from '../shared/components/Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CardDetails from '../shared/components/CardDetails';
import { getCase, needAction, searchData } from '../utils/requests';
import Loading from '../../components/Loading';
import Button from '../shared/components/Button';
import CheckApplication from '../pages/checkApplication';
import SkeletonLoader from '../shared/components/SkeletonLoader';

export default function Applications({ d, sortList, setLActive, lActive, getTabData, isIdentifier, usersList }) {
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
	const [alert, setAlert] = useState(null);
	const [product, setProduct] = useState(null);
	const [assignmentLog, setAssignmentLog] = useState(null);

	useEffect(async () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			if (e === lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
				});
				needAction(JSON.stringify(['Branch Review', 'Pending Applications'])).then(res => {
					setAlert(res.length);
				});
			}
		});
	}, []);

	const submitCase = () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			console.log('ff');
			if (e === lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
				});
			}
		});
	};

	const [clicked, setClicked] = useState(false);

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

	const history = useHistory();
	const [id, setId] = useState(null);
	const [viewLoan, setViewLoan] = useState(false);
	const [activ, setActiv] = useState('Applicant');
	const [serachStarted, setSearch] = useState(false);

	const search = e => {
		if (e.target.value.length === 0) {
			setSearch(true);
			Object.keys(mapp).map(async e => {
				if (e === lActive) {
					const res = await getCase(mapp[e]);
					setSearch(false);
					setData(res);
				}
			});
		} else if (e.target.value.length > 2) {
			setSearch(true);
			setTimeout(() => {
				searchData(e.target.value).then(res => {
					setSearch(false);
					setData(res);
				});
			}, 3000);
		}
	};

	return !viewLoan ? (
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
				className='absolute right-0 px-24 scroll flex flex-col'
				style={{
					width: '100%',
					maxWidth: 'calc(100vw - 20%)',
					maxHeight: 'calc(100vh)',
					overflow: 'scroll'
				}}
			>
				<section
					style={{ boxShadow: '0 0 10px 0px #98AFC7' }}
					className='absolute top-32 flex self-end rounded-full self-end'
				>
					<Button rounded='rfull' type='gray-white' className='btn'>
						<small>Need Attention</small>{' '}
						<span className='mx-1 bg-red-500 rounded-full px-2 text-white'>{alert !== null && alert}</span>
					</Button>
				</section>
				<section className='top-40 w-full absolute flex gap-x-10 items-center'>
					<section className='w-1/2 flex items-center mt-10'>
						<input
							className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none  rounded-l-full'
							placeholder='Search application name, loan type, loan amount'
							onChange={e => search(e)}
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
				<section className='w-full gap-20 flex grid grid-cols-2 pb-10' style={{ paddingTop: '20em' }}>
					{loading && (
						<section className='flex items-center justify-center'>
							<section className='w-full'>
								<Loading />
							</section>
						</section>
					)}
					{data && typeof data === 'object' && data.length
						? data.map(item => (
								<CardDetails
									setViewLoan={setViewLoan}
									label={lActive}
									full={true}
									item={item}
									lActive={lActive}
									setId={setId}
									setActiv={setActiv}
									setClicked={setClicked}
									setProduct={setProduct}
									setAssignmentLog={setAssignmentLog}
									submitCase={submitCase}
								/>
						  ))
						: !loading && <span className='text-start w-full opacity-50'>No Applications</span>}
					{serachStarted && <Loading />}
				</section>
			</section>
		</section>
	) : (
		<CheckApplication
			usersList={usersList && usersList}
			assignmentLog={assignmentLog}
			product={product && product}
			id={id && id}
			activ={activ}
		/>
	);
}
