import { useEffect, useState, useRef } from 'react';
//import { useHistory } from 'react-router-dom';
import './styles/index.scss';
import Tabs from '../shared/components/Tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CardDetails from '../shared/components/CardDetails';
import {
	getCase,
	needAction,
	searchData,
	//getNCStatus,
	filterList,
} from '../utils/requests';
import Loading from '../../components/Loading';
import Button from '../shared/components/Button';
import CheckApplication from '../pages/checkApplication';
import { useSelector, useDispatch } from 'react-redux';
import { branchAction } from '../../Store/branchSlice';

export default function Applications({
	d,
	sortList,
	getTabData,
	isIdentifier,
	usersList,
}) {
	const [data, setData] = useState(null);
	const mapp = {
		'Pending Applications': 'Pending Applications',
		'In-Progress@NC': 'NC In-Progress',
		'Branch Review': 'Branch Review',
		'In-Progress@AO': 'In-Progress At AO',
		Sanctioned: 'Sanctioned',
		Rejected: 'Rejected',
	};

	const searchRef = useRef();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState(null);
	const selector = useSelector(state => state.branchFlow);
	useEffect(async () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			if (e === selector?.lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
					return null;
				});
				needAction(
					JSON.stringify(['Branch Review', 'Pending Applications'])
				).then(res => {
					setAlert(res?.length);
				});
			}
		});
	}, []);

	const submitCase = () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			if (e === selector?.lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
				});
			}
			return null;
		});
	};

	//const [clicked, setClicked] = useState(false);

	const getTabs = item => (
		<Tabs
			length={data && data.length}
			k={item.label}
			active={selector?.lActive === item.label}
			click={event => {
				searchRef.current.value = '';
				dispatch(branchAction.setLActiveAction(event));
			}}
			align='vertical'
			lActive={selector?.lActive}
			setData={setData}
			setLoading={setLoading}
		/>
	);

	//const history = useHistory();
	const [serachStarted, setSearch] = useState(false);

	useEffect(async () => {
		setLoading(true);
		Object.keys(mapp).map(e => {
			if (e === selector?.lActive) {
				getCase(mapp[e]).then(res => {
					setLoading(false);
					setData(res);
				});
				needAction(
					JSON.stringify(['Branch Review', 'Pending Applications'])
				).then(res => {
					setAlert(res?.length);
				});
			}
		});
	}, [selector?.viewLoan]);

	const search = e => {
		if (e.target.value.length === 0) {
			setSearch(true);
			Object.keys(mapp).map(async e => {
				if (e === selector?.lActive) {
					const res = await getCase(mapp[e]);
					setSearch(false);
					setData(res);
				}
			});
		} else if (e.target.value.length > 2) {
			setSearch(true);
			setTimeout(() => {
				searchData(e.target.value, mapp[(selector?.lActive)]).then(res => {
					setSearch(false);
					setData(res);
				});
			}, 3000);
		}
	};

	const [setFiltering] = useState(false);
	const dropdown = e => {
		if (e === 'week' || e === 'month' || e === 'year') {
			setFiltering(true);
			setTimeout(() => {
				filterList(e.target.value).then(res => {
					setFiltering(false);
					setData(res);
				});
			}, 3000);
		}
	};

	return !selector?.viewLoan ? (
		<section className='flex'>
			<section
				style={{
					overflow: 'scroll',
					maxHeight: 'calc(100vh - 5.8rem)',
					height: 'calc(100vh - 5.8rem)',
					paddingLeft: '2rem',
				}}
				className='scroll absolute bg-blue-700 w-1/5 py-16 flex flex-col gap-y-8 bottom-0'>
				<span className='text-white font-medium text-xl pl-8'>
					Loan Applications
				</span>
				<section>
					{d.map((item, idx) =>
						isIdentifier()
							? item.label !== 'Branch Review' && getTabs(item)
							: getTabs(item)
					)}
				</section>
			</section>
			<section
				className='absolute scroll right-0 px-24 flex flex-col'
				style={{
					width: '100%',
					maxWidth: 'calc(100vw - 20%)',
					maxHeight: 'calc(100vh)',
					overflow: 'scroll',
				}}>
				<section
					style={{ boxShadow: '0 0 10px 0px #98AFC7' }}
					className='absolute top-32 flex self-end rounded-full self-end'>
					<Button rounded='rfull' type='gray-white' className='btn'>
						<small>Need Attention</small>{' '}
						<span className='mx-1 bg-red-500 rounded-full px-2 text-white'>
							{alert !== null && alert}
						</span>
					</Button>
				</section>
				<section className='top-40 w-full absolute flex gap-x-10 items-center'>
					<section className='w-1/2 flex items-center mt-10'>
						<input
							className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none  rounded-l-full'
							placeholder='Search application name, loan type, loan amount'
							onChange={search}
							ref={searchRef}
						/>
						<FontAwesomeIcon
							className='h-12 rounded-r-full cursor-pointer bg-blue-100 text-indigo-700 text-5xl px-4 p-2'
							icon={faSearch}
						/>
					</section>
					<section className='flex w-1/3 gap-x-4 mt-10 items-center'>
						<span className='w-16'>Filter by</span>
						<div className='select_box w-full'>
							<select
								className='dropdown focus:outline-none bg-transparent'
								onChange={e => dropdown(e)}>
								{sortList.map(el => (
									<option>{el}</option>
								))}
							</select>
						</div>
					</section>
				</section>
				{/* grid grid-cols-2 */}
				<section
					className='w-full gap-20 justify-between flex flex-wrap pb-10'
					style={{ paddingTop: '20em' }}>
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
									label={selector?.lActive}
									full={true}
									item={item}
									//setClicked={setClicked}
									submitCase={submitCase}
									usersList={usersList}
									width={true}
								/>
						  ))
						: !loading && (
								<span className='text-start w-full opacity-50'>
									No Applications
								</span>
						  )}
					{serachStarted && <Loading />}
				</section>
			</section>
		</section>
	) : (
		<CheckApplication
			usersList={usersList}
			assignmentLog={selector?.assignmentLog}
			product={selector?.product}
			id={selector?.id}
			activ={selector?.activ}
			item={selector?.item}
			productId={selector?.productID}
			activeTab={selector?.lActive}
		/>
	);
}
