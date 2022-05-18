import { useState, lazy, useContext, useEffect } from 'react';

import { BranchUserContext } from '../../reducer/branchUserReducer';

import '../components/styles/index.scss';
import { getUsersList } from '../utils/requests';
import { useDispatch, useSelector } from 'react-redux';
import { branchAction } from '../../Store/branchSlice';

const Applications = lazy(() => import('../components/Applications'));
const Home = lazy(() => import('../components/Home'));
const Layout = lazy(() => import('../Layout'));

export default function Dashboard(props) {
	// getNCStatus();
	const [usersList, setUsersList] = useState(null);
	const { actions } = useContext(BranchUserContext);
	const arr = window.location.href.split('?');
	const arrr = arr[1]?.split('=');
	arrr?.splice(0, 1);
	const y = arrr?.join('=');
	const o = y?.split('&');
	const token = o && o[0];
	const [current, setCurrent] = useState(
		sessionStorage.getItem('lActive') || 'Home'
	);
	const selector = useSelector(state => state.branchFlow);

	const dispatch = useDispatch();

	useEffect(() => {
		if (token) {
			sessionStorage.removeItem('lActive');
			sessionStorage.setItem('token', token);
			actions.setBranchUserToken(token);
		}
		if (!sessionStorage.getItem('token')) {
			window.location.href = `${window.location.origin}/branch/login`;
			// history.push(`/branch/login`);
		}
		getUsersList().then(res => {
			setUsersList(res);
		});
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		sessionStorage.setItem('lActive', current);
		dispatch(branchAction.setResetLoanAction());
		// eslint-disable-next-line
	}, [current]);

	const isIdentifier = () => {
		return props.location.pathname === '/branch-user';
	};

	const getTabData = i => {
		return i === selector?.lActive;
	};
	const options = [
		{
			label: 'Total Applications Initiated',
			week: 20,
			month: 50,
		},
		{
			label: 'Applications Initiated Online',
			week: 50,
			month: 40,
		},
		{
			label: 'Application Initiated at Branch',
			week: 30,
			month: 70,
		},
		{
			label: 'Total Application Sanctioned',
			week: 70,
			month: 60,
		},
	];

	const sortList = ['This week', 'This month', 'This year'];

	const dChartData = [
		{
			online_applications: {
				label: 'Online Applications',
				data: [
					{
						initiated: {
							label: 'Initiated',
							value: 20,
							highlight: 'rgba(79, 70, 229)',
						},
					},
					{
						sanctioned: {
							label: 'Sanctioned',
							value: 12,
							highlight: 'rgba(29, 78, 216)',
						},
					},
					{
						inProgress: {
							label: 'In Progress',
							value: 6,
							highlight: ' rgba(59, 130, 246)',
						},
					},
					{
						pending: {
							label: 'Pending',
							value: 4,
							highlight: 'rgb(76, 187, 224)',
						},
					},
					{
						rejected: {
							label: 'Rejected',
							value: 2,
							highlight: 'rgba(147, 197, 253)',
						},
					},
				],
			},
		},
		{
			branch_queue_applications: {
				label: 'Branch-Queue Applications',
				data: [
					{
						initiated: {
							label: 'Initiated',
							value: 15,
							highlight: 'rgba(79, 70, 229)',
						},
					},
					{
						sanctioned: {
							label: 'Sanctioned',
							value: 12,
							highlight: 'rgba(29, 78, 216)',
						},
					},
					{
						inProgress: {
							label: 'In Progress',
							value: 16,
							highlight: ' rgba(59, 130, 246)',
						},
					},
					{
						pending: {
							label: 'Pending',
							value: 7,
							highlight: 'rgb(76, 187, 224)',
						},
					},
					{
						rejected: {
							label: 'Rejected',
							value: 4,
							highlight: 'rgba(147, 197, 253)',
						},
					},
				],
			},
		},
	];

	const [data] = useState(options);
	const d = [
		{
			label: 'Pending Applications',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 580,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 610,
					preEligibleAmount: '5,40,000',
					DSCR: 1.25,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 280,
					preEligibleAmount: '5,40,000',
					DSCR: 1.75,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 380,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 680,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 680,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
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
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 410,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 180,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 700,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
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
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 530,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
		},
		{
			label: 'In-Progress@AO',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 100,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 590,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 200,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
		},
		{
			label: 'Sanctioned',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 200,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 200,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
		},
		{
			label: 'Rejected',
			data: [
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 200,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
				{
					customer_name: 'XYZ Private Limited',
					loan_type: 'Auto Loan',
					loan_value: '6 Lakhs',
					assigned_at: new Date().toDateString(),
					cibil: 200,
					preEligibleAmount: '5,40,000',
					DSCR: 2.5,
					monthly_income: '40,000',
					assigned_by: 'Himanshu',
				},
			],
		},
	];

	const onTabChange = e => setCurrent(e);

	return (
		<>
			<Layout
				k={current}
				padding={current !== 'Home' && 'p-0'}
				onTabChange={onTabChange}>
				{current === 'Home' && (
					<Home
						data={data}
						sortList={sortList}
						dChartData={dChartData}
						getTabData={getTabData}
						d={d}
						isIdentifier={isIdentifier}
						usersList={usersList && usersList}
					/>
				)}
			</Layout>
			{current === 'Loan Applications' && (
				<Applications
					d={d}
					sortList={sortList}
					getTabData={getTabData}
					isIdentifier={isIdentifier}
					usersList={usersList && usersList}
				/>
			)}
		</>
	);
}
