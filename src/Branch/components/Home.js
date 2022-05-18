import { useEffect, useState } from 'react';
import { LineChart, Line, Pie, PieChart, Cell } from 'recharts';
import { useSelector } from 'react-redux';
import './styles/index.scss';
import Card from '../shared/components/Card';
import CardDetails from '../shared/components/CardDetails';
import {
	getCase,
	getWhiteLabelPermission,
	dashboardData,
} from '../utils/requests';
import Loading from '../../components/Loading';

import CheckApplication from '../pages/checkApplication';

export default function Home({
	data,
	sortList,
	dChartData,
	d,
	isIdentifier,
	usersList,
}) {
	dashboardData();
	getWhiteLabelPermission();

	var pieD1 = [];
	var pieD2 = [];
	// const {
	// 	state: { userToken },
	// } = useContext(BranchUserContext);

	dChartData.map((item, index) =>
		Object.keys(item).map(i =>
			item[i].data.map((el, idx) =>
				Object.keys(el).map(o => {
					index === 0 && pieD1.push(item[i].data[idx][o]);
					index === 1 && pieD2.push(item[i].data[idx][o]);
					return null;
				})
			)
		)
	);

	const [paData, setPaData] = useState(null);
	const [sanData, setSanData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const bankApp = async () => {
			setLoading(true);
			getCase('Pending Applications').then(res => {
				if (res && res.length > 0) {
					setPaData(res);
					setLoading(false);
				}
			});
			getCase('Sanctioned').then(res => {
				if (res && res.length > 0) {
					setSanData(res);
					setLoading(false);
				}
			});
		};
		bankApp();
	}, []);

	const selector = useSelector(state => state.branchFlow);

	return !loading ? (
		!selector?.viewLoan ? (
			<section className='flex flex-col gap-y-10 pt-24'>
				<h1 className='text-xl'>Dashboard</h1>
				<section className='flex justify-between gap-x-6'>
					{data.map(item => (
						<Card small={true} key={item} head={item.label}>
							<section className='flex justify-between'>
								<span className='flex flex-col items-center'>
									{item.week}
									<small>this week</small>
								</span>
								<LineChart width={50} height={50} data={data}>
									<Line
										type='monotone'
										dataKey='week'
										dot={false}
										stroke='green'
									/>
								</LineChart>
								<span className='flex flex-col items-center'>
									{item.month}
									<small>this month</small>
								</span>
								<LineChart width={50} height={50} data={data}>
									<Line
										type='monotone'
										dataKey='month'
										dot={false}
										stroke='red'
									/>
								</LineChart>
							</section>
						</Card>
					))}
				</section>
				<section className='flex gap-x-4 items-center'>
					<span className='w-16'>Filter by</span>
					<div className='select_box w-full'>
						<select className='dropdown focus:outline-none bg-transparent'>
							{sortList.map(el => (
								<option>{el}</option>
							))}
						</select>
					</div>
				</section>
				<section className='flex justify-between gap-x-10'>
					{dChartData.map((item, index) =>
						Object.keys(item).map(i => (
							<Card
								medium={true}
								full={true}
								key={item[i].label}
								head={item[i].label}>
								<section className='w-full flex items-center justify-between'>
									<section>
										<PieChart width={300} height={180}>
											<Pie
												data={index === 1 ? pieD2 : pieD1}
												cx={120}
												cy={80}
												innerRadius={60}
												outerRadius={80}
												fill='#8884d8'
												paddingAngle={5}
												dataKey='value'>
												{(index === 1 ? pieD2 : pieD1).map((el, index) => (
													<Cell key={`cell-${index}`} fill={el.highlight} />
												))}
											</Pie>
										</PieChart>
									</section>
									<section className='flex flex-col gap-y-2'>
										<small className='text-md'>No of Applications:</small>
										<ul className='flex flex-col gap-y-1'>
											{item[i].data.map(el =>
												Object.keys(el).map(e => (
													<li className='flex items-center justify-between bg-gray-300 rounded-full p-1 '>
														<section className='flex items-center'>
															<span
																className={`h-4 w-4 rounded-full`}
																style={{
																	backgroundColor: `${el[e].highlight}`,
																}}
															/>
															<small
																style={{
																	margin: '0 5px',
																	whiteSpace: 'nowrap',
																}}>
																{el[e].label}
															</small>
														</section>
														<small className='pr-2'>{el[e].value}</small>
													</li>
												))
											)}
										</ul>
									</section>
								</section>
							</Card>
						))
					)}
					<section className='w-9/12'>
						<Card medium={true} full={true} head='Average Tat'>
							<span>4 Hours</span>
						</Card>
					</section>
				</section>
				<section className='flex flex-col gap-y-24'>
					<section className='flex flex-col gap-y-10'>
						<h1 className='text-xl'>Pending Applications</h1>
						<section className='flex gap-x-10'>
							{paData && paData.length ? (
								paData.map(
									(item, idx) =>
										idx < 3 && (
											<CardDetails
												label='Pending Applications'
												full={true}
												item={item}
												usersList={usersList}
											/>
										)
								)
							) : (
								<span className='text-center w-full opacity-50'>
									No Applications
								</span>
							)}
						</section>
					</section>
					<section className='flex flex-col gap-y-10'>
						{!isIdentifier() && (
							<h1 className='text-xl'>Sanctioned Applications</h1>
						)}
						<section className='flex gap-x-10'>
							{!isIdentifier() && sanData && sanData.length ? (
								sanData.map(
									(item, idx) =>
										idx < 3 && (
											<CardDetails
												label='Sanctioned'
												full={true}
												item={item}
												usersList={usersList}
											/>
										)
								)
							) : (
								<span className='text-center w-full opacity-50'>
									No Applications
								</span>
							)}
						</section>
					</section>
				</section>
			</section>
		) : (
			<CheckApplication
				setViewLoan={selector?.viewLoan}
				assignmentLog={selector?.assignmentLog}
				home={true}
				product={selector?.product}
				id={selector?.id}
				activ={selector?.activ}
				usersList={usersList && usersList}
				item={selector?.item}
				productId={selector?.productID}
			/>
		)
	) : (
		loading && (
			<section className='flex items-center justify-center'>
				<section className='w-7/12'>
					<Loading />
				</section>
			</section>
		)
	);
}
