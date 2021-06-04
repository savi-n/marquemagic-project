import { useState, lazy } from 'react';
import '../../components/styles/index.scss';
const Applications = lazy(() => import('../../components/Applications'));
const Home = lazy(() => import('../../components/Home'));
const Layout = lazy(() => import('../../Layout'));

export default function Dashboard() {
	const options = [
		{
			label: 'Total Applications Initiated',
			week: 20,
			month: 50
		},
		{
			label: 'Applications Initiated Online',
			week: 50,
			month: 40
		},
		{
			label: 'Application Initiated at Branch',
			week: 30,
			month: 70
		},
		{
			label: 'Total Application Sanctioned',
			week: 70,
			month: 60
		}
	];

	const sortList = ['This week', 'This month', 'This year'];

	const dChartData = [
		{
			online_applications: {
				label: 'Online Applications',
				data: [
					{ initiated: { label: 'Initiated', value: 20, highlight: 'rgba(79, 70, 229)' } },
					{ sanctioned: { label: 'Sanctioned', value: 12, highlight: 'rgba(29, 78, 216)' } },
					{ inProgress: { label: 'In Progress', value: 6, highlight: ' rgba(59, 130, 246)' } },
					{ rejected: { label: 'Rejected', value: 2, highlight: 'rgba(147, 197, 253)' } }
				]
			}
		},
		{
			branch_queue_applications: {
				label: 'Branch-Queue Applications',
				data: [
					{ initiated: { label: 'Initiated', value: 15, highlight: 'rgba(79, 70, 229)' } },
					{ sanctioned: { label: 'Sanctioned', value: 12, highlight: 'rgba(29, 78, 216)' } },
					{ inProgress: { label: 'In Progress', value: 16, highlight: ' rgba(59, 130, 246)' } },
					{ rejected: { label: 'Rejected', value: 4, highlight: 'rgba(147, 197, 253)' } }
				]
			}
		}
	];

	const pApprovalData = {
		key: 'Pending Approvals',
		data: [
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			},
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			},
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			},
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			},
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			},
			{
				customer_name: 'XYZ Private Limited',
				loan_type: 'Auto Loan',
				loan_value: '6 Lakhs',
				assigned_at: new Date().toDateString(),
				cibil: 680,
				preEligibleAmount: 540000
			}
		]
	};

	const [data, setData] = useState(options);
	const [current, setCurrent] = useState('Home');
	const d = ['Pending Approvals', 'In-Progress@NC', 'In-Progress@AO', 'Sanctioned', 'Rejected'];
	const [lActive, setLActive] = useState('Pending Approvals');

	const onTabChange = e => setCurrent(e);

	return (
		<>
			<Layout k={current} padding={current !== 'Home' && 'p-0'} onTabChange={onTabChange}>
				{current === 'Home' && (
					<Home data={data} sortList={sortList} dChartData={dChartData} pApprovalData={pApprovalData} />
				)}
			</Layout>
			{current === 'Loan Applications' && (
				<Applications d={d} pApprovalData={pApprovalData} setLActive={setLActive} lActive={lActive} />
			)}
		</>
	);
}
