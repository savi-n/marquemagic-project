import { useState, lazy } from 'react';
import '../../components/styles/index.scss';
const Applications = lazy(() => import('../../components/Applications'));
const Home = lazy(() => import('../../components/Home'));
const Layout = lazy(() => import('../../Layout'));

export default function Dashboard(props) {
	const isIdentifier = () => {
		return props.location.pathname === '/branch-user';
	};

	const getTabData = i => {
		return i === lActive;
	};
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

	const [data, setData] = useState(options);
	const [current, setCurrent] = useState('Home');
	const d = [
		{
			label: 'Pending Approvals',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 580,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 610,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 280,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 380,
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
		},
		{
			label: 'In-Progress@NC',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 480,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 410,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 180,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 700,
					preEligibleAmount: 540000
				}
			]
		},
		{
			label: 'Branch Review',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 290,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 530,
					preEligibleAmount: 540000
				}
			]
		},
		{
			label: 'In-Progress@AO',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 480,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 480,
					preEligibleAmount: 540000
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 480,
					preEligibleAmount: 540000
				}
			]
		},
		{ label: 'Sanctioned', data: [] },
		{ label: 'Rejected', data: [] }
	];
	const [lActive, setLActive] = useState('Pending Approvals');

	const onTabChange = e => setCurrent(e);

	return (
		<>
			<Layout k={current} padding={current !== 'Home' && 'p-0'} onTabChange={onTabChange}>
				{current === 'Home' && (
					<Home
						data={data}
						sortList={sortList}
						dChartData={dChartData}
						getTabData={getTabData}
						d={d}
						isIdentifier={isIdentifier}
					/>
				)}
			</Layout>
			{current === 'Loan Applications' && (
				<Applications
					d={d}
					setLActive={setLActive}
					sortList={sortList}
					getTabData={getTabData}
					lActive={lActive}
					isIdentifier={isIdentifier}
				/>
			)}
		</>
	);
}
