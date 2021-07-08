import { useState, useEffect } from 'react';
import { Route, BrowserRouter, useRouteMatch, useHistory } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import ProgressBar from './progressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUpload,
	faUser,
	faEnvelopeOpenText,
	faDownload,
	faInfo,
	faPlayCircle,
	faComment,
	faChevronCircleDown,
	faFolderOpen,
	faAddressCard,
	faHistory,
	faCampground
} from '@fortawesome/free-solid-svg-icons';
import SharedCAT from '../../components/sharedCAT';
import { getLoanDetails, loanDocMapping, getUsersList, getLoan } from '../../utils/requests';
import checkApplication from '../../pages/checkApplication';

export default function CardDetails({
	item,
	label,
	full,
	idx,
	lActive,
	setViewLoan,
	setId,
	setActiv,
	setClicked,
	setProduct,
	setAssignmentLog,
	usersList,
	submitCase,
	setProductId
}) {
	const [security, setSecurity] = useState(false);
	const [recommendation, setRecommendation] = useState(false);
	const [download, setDownload] = useState(false);
	const [queries, setQuery] = useState(false);
	const [status, setStatus] = useState(false);
	const [reassign, setReassign] = useState(false);
	const [reconsider, setReconsider] = useState(false);
	const [comments, setComments] = useState(false);
	const [reopen, setReopen] = useState(false);
	const [AR, setAR] = useState(false);
	const [approvalHistory, setApprovalHistory] = useState(false);
	const [reasonForRejection, setReasonforRejection] = useState(false);

	const cibilPercentage = cibil => {
		return Math.floor((Number(cibil) / 900) * 100);
	};

	const [userList, setUserList] = useState(null);

	// useEffect(() => {
	// 	getUsersList().then(res => {
	// 		setUserList(res.data.userList);
	// 	});
	// }, [userList]);

	const mapper = {
		'Pending Applications': ['Upload', 'Reassign', 'Recommendation'],
		'In-Progress@NC': [],
		'Branch Review': ['Reassign', 'Upload', 'Recommendation', 'Download', 'Queries'],
		'In-Progress@AO': ['Download', 'Status', 'Queries'],
		Sanctioned: ['Download', 'Reassign', 'Upload', 'Reconsider', 'Comments', 'Approve/Reject'],
		Rejected: ['Reopen', 'Reason for Rejection', 'Approval History', 'Download', 'Reconsider']
	};

	const iconMapper = {
		Upload: faUpload,
		Reassign: faUser,
		Recommendation: faEnvelopeOpenText,
		Download: faDownload,
		Queries: faInfo,
		Status: faPlayCircle,
		Comments: faComment,
		'Approve/Reject': faChevronCircleDown,
		Reopen: faFolderOpen,
		'Reason for Rejection': faAddressCard,
		'Approval History': faHistory,
		Reconsider: faCampground
	};

	const bMapper = {
		'Pending Applications': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Pre-Eligibility', 'Co-Applicant', 'Create Security'] }
		],
		'In-Progress@NC': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Pre-Eligibility', 'Branch Notes'] }
		],
		'Branch Review': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Data', 'Co-Applicant', 'Check Security'] }
		],
		'In-Progress@AO': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Data', 'Branch Notes'] }
		],
		Sanctioned: [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Data', 'Sanction details', 'Branch Notes'] }
		],
		Rejected: [{ data: ['Check Application'] }, { data: ['Eligibility Data'] }]
	};

	const getMapper = d => {
		return mapper[d];
	};

	const getBMapper = d => {
		return bMapper[d];
	};

	const getClicker = e => {
		setSecurity(e === 'Upload');
		setRecommendation(e === 'Recommendation');
		setReconsider(e === 'Reconsider');
		setComments(e === 'Comments');
		setQuery(e === 'Queries');
		setReasonforRejection(e === 'Reason for Rejection');
		setApprovalHistory(e === 'Approval History');
		setAR(e === 'Approve/Reject');
		setReopen(e === 'Reopen');
		setReassign(e === 'Reassign');
		setStatus(e === 'Status');
		setDownload(e === 'Download');
	};

	const getRecom = data => {
		const a = JSON.parse(data);
		return a;
	};

	const t = getRecom(item.remarks);

	// getLoanDetails(item.id);

	return (
		<Card
			full={full}
			security={security}
			recommendation={recommendation}
			AR={AR}
			status={status}
			download={download}
			reconsider={reconsider}
			comments={comments}
			reasonForRejection={reasonForRejection}
			reopen={reopen}
			reassign={reassign}
			approvalHistory={approvalHistory}
			queries={queries}
		>
			<section className='flex justify-between'>
				<section className='flex flex-col gap-y-4 w-full z-10'>
					<section className='flex items-center items-center justify-between'>
						<section className='flex flex-col w-1/2'>
							<small>{item.businessname || 'Sample Case'}</small>
							<span>
								<span className='text-xs'>{item.product || 'Auto Loan'}</span>, <br />
								{item.loan_amount} {item.loan_amount_um}
							</span>
							{item.net_monthly_income && (
								<small>
									₹ <span className='text-lg'>{item.net_monthly_income}</span> Monthly Income
								</small>
							)}
						</section>
						<section className='flex flex-col items-end gap-y-2'>
							{label
								? getBMapper(label)[0].data.map(e => (
										<Button
											size='small'
											type='blue-light'
											rounded='rfull'
											width='fulll'
											onClick={() => {
												setProductId && setProductId(item.loan_product_id);
												item.assignmentLog
													? setAssignmentLog && setAssignmentLog(item.assignmentLog)
													: setAssignmentLog && setAssignmentLog(null);
												setViewLoan(true);
												setProduct(item.product);
												setId(item.id);
												e === 'Check Documents'
													? setActiv('Document Details')
													: item.product !== 'Unsecured Business/Self-Employed' &&
													  item.product !== 'LAP Cases'
													? setActiv('Applicant')
													: setActiv('Business Details');
											}}
										>
											{e}
										</Button>
								  ))
								: null}
						</section>
					</section>
					<hr />
					<section className='flex items-center items-center justify-between'>
						<section className='flex flex-col'>
							<span>CIBIL score: {item.dcibil_score || 590}</span>
							<ProgressBar percentage={cibilPercentage(item.cibil || 590)} />
							<span>Pre-eligibility: Rs. {item.pre_eligiblity?.case0}</span>
							<span
								className={`p-1 rounded text-center text-white text-xs w-5/12 bg-${
									item.dscr > 2 ? 'green-500' : item.dscr > 1.5 ? 'yellow-400' : 'red-600'
								}`}
							>
								DSCR: {item.dscr?.toFixed(2)}
							</span>
						</section>
						<section className='flex flex-col items-end gap-y-2'>
							{label
								? getBMapper(label)[1].data.map(e => (
										<Button
											size='small'
											type='blue-light'
											rounded='rfull'
											width='fulll'
											onClick={() => {
												setProduct && setProduct(item.product);
												setProductId && setProductId(item.loan_product_id);
												item.assignmentLog
													? setAssignmentLog && setAssignmentLog(item.assignmentLog)
													: setAssignmentLog && setAssignmentLog(null);
												setViewLoan && setViewLoan(true);
												setId && setId(item.id);
												setActiv &&
													setActiv(
														e === 'Pre-Eligibility'
															? 'Pre-Eligibility Details'
															: e === 'Create Security'
															? 'Security Details'
															: e
													);
											}}
										>
											{e}
										</Button>
								  ))
								: null}
						</section>
					</section>
					<hr />
					<section className='flex justify-between'>
						<section className='flex flex-col text-xs'>
							<small>
								Assigned at: {t?.assignedAt || item.assigned_date || new Date().toDateString()}
							</small>
							<small>Assigned by: {t?.assignedBy || item.assigned_by}</small>
							{userList && item.assignmentLog && (
								<small>
									Assigned To:
									{
										usersList.filter(
											e => e.id === JSON.parse(item.assignmentLog.remarks).assignedTo
										)[0]?.name
									}
								</small>
							)}
						</section>
						<section className='flex gap-x-4'>
							{label &&
								getMapper(label).map(e => (
									<section className='flex justify-end cursor-pointer'>
										<div class='tooltip' onClick={() => getClicker(e)}>
											<FontAwesomeIcon icon={iconMapper[e]} />
											<span class='tooltiptext'>{e}</span>
										</div>
									</section>
								))}
						</section>
					</section>
				</section>
				{(security ||
					recommendation ||
					queries ||
					reconsider ||
					status ||
					download ||
					comments ||
					reopen ||
					AR ||
					reassign ||
					approvalHistory ||
					reasonForRejection) && (
					<SharedCAT
						type={
							(security && 'Upload') ||
							(recommendation && 'Recommendation') ||
							(queries && 'Queries') ||
							(reconsider && 'Reconsider') ||
							(status && 'Status') ||
							(download && 'Download') ||
							(comments && 'Comments') ||
							(reopen && 'Reopen') ||
							(AR && 'Approve/Reject') ||
							(reassign && 'Reassign') ||
							(approvalHistory && 'Approval History') ||
							(reasonForRejection && 'Reason for Rejection')
						}
						getCLicker={getClicker}
						item={item}
						lActive={lActive}
						setClicked={setClicked}
						submitCase={submitCase}
					/>
				)}
			</section>
		</Card>
	);
}
