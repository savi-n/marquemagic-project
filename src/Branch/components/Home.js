import { useEffect, useState } from 'react';
import { LineChart, Line, Pie, PieChart, Cell } from 'recharts';
import './styles/index.scss';
import Card from '../shared/components/Card';
import CardDetails from '../shared/components/CardDetails';
import { getCase } from '../utils/requests';
import Loading from '../../components/Loading';

export default function Home({ data, sortList, dChartData, d, isIdentifier, lActive }) {
	var pieD1 = [];
	var pieD2 = [];

	dChartData.map((item, index) =>
		Object.keys(item).map(i =>
			item[i].data.map((el, idx) =>
				Object.keys(el).map(o => {
					index === 0 && pieD1.push(item[i].data[idx][o]);
					index === 1 && pieD2.push(item[i].data[idx][o]);
				})
			)
		)
	);

	const [paData, setPaData] = useState(null);
	const [sanData, setSanData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(async () => {
		setLoading(true);
		getCase('Pending Applications').then(res => {
			if (res.statusCode === 'NC200') {
				setPaData(res);
				setLoading(false);
			}
		});
		getCase('Sanctioned').then(res => {
			if ((res.statusCode = 'NC200')) {
				setSanData(res);
				setLoading(false);
			}
		});
	}, []);

	return !loading ? (
		<section className='flex flex-col gap-y-10 pt-24'>
			<h1 className='text-xl'>Dashboard</h1>
			<section className='flex justify-between gap-x-6'>
				{data.map(item => (
					<Card full={true} key={item} head={item.label}>
						<section className='flex justify-between'>
							<span className='flex flex-col items-center'>
								{item.week}
								<small>this week</small>
							</span>
							<LineChart width={50} height={50} data={data}>
								<Line type='monotone' dataKey='week' dot={false} stroke='green' />
							</LineChart>
							<span className='flex flex-col items-center'>
								{item.month}
								<small>this month</small>
							</span>
							<LineChart width={50} height={50} data={data}>
								<Line type='monotone' dataKey='month' dot={false} stroke='red' />
							</LineChart>
						</section>
					</Card>
				))}
			</section>
			<section className='flex gap-x-4 items-center'>
				<span className='w-16'>Sort by</span>
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
						<Card full={true} key={item[i].label} head={item[i].label}>
							<section className='w-full flex items-center'>
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
											dataKey='value'
										>
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
												<li className='flex items-center justify-between bg-gray-300 rounded-full p-1 gap-x-4'>
													<section className='flex items-center gap-x-1'>
														<span
															className={`h-4 w-4 rounded-full`}
															style={{ backgroundColor: `${el[e].highlight}` }}
														></span>
														<small>{el[e].label}</small>
													</section>
													<small className='px-2'>{el[e].value}</small>
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
					<Card full={true} head='Average Tat'>
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
											lActive={lActive}
										/>
									)
							)
						) : (
							<span className='text-center w-full opacity-50'>No Applications</span>
						)}
					</section>
				</section>
				<section className='flex flex-col gap-y-10'>
					{!isIdentifier() && <h1 className='text-xl'>Pending Sanctions</h1>}
					<section className='flex gap-x-10'>
						{!isIdentifier() && sanData && sanData.length ? (
							sanData.map(
								(item, idx) =>
									idx < 3 && (
										<CardDetails label='Sanctioned' full={true} item={item} lActive={lActive} />
									)
							)
						) : (
							<span className='text-center w-full opacity-50'>No Applications</span>
						)}
					</section>
				</section>
			</section>
		</section>
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
