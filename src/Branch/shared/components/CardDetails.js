import { useState } from 'react';
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
import { getLoanDetails } from '../../utils/requests';

export default function CardDetails({ item, label, full, idx, lActive }) {
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
			{ data: ['Pre-Eligibility', 'Co-applicants', 'Create Security'] }
		],
		'In-Progress@NC': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Pre-Eligibility', 'Branch Notes'] }
		],
		'Branch Review': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Details', 'Co-applicants', 'Check Security'] }
		],
		'In-Progress@AO': [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Details', 'Branch Notes'] }
		],
		Sanctioned: [
			{ data: ['Check Application', 'Check Documents'] },
			{ data: ['Eligibility Details', 'Sanction details', 'Branch Notes'] }
		],
		Rejected: [{ data: ['Check Application'] }, { data: ['Eligibility Details'] }]
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

	getLoanDetails(item.id);

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
						<section className='flex flex-col'>
							<small>{item.businessname || 'Sample Case'}</small>
							<span>
								{item.loan_type || 'Auto Loan'}, {item.loan_amount} {item.loan_amount_um}
							</span>
							<small>
								₹ <span className='text-lg'>{item.monthly_income || '80000'}</span> Monthly Income
							</small>
						</section>
						<section className='flex flex-col items-end gap-y-2'>
							{label
								? getBMapper(label)[0].data.map(e => (
										<Button size='small' type='blue-light' rounded='rfull' width='fulll'>
											{e}
										</Button>
								  ))
								: null}
						</section>
					</section>
					<hr />
					<section className='flex items-center items-center justify-between'>
						<section className='flex flex-col'>
							<span>CIBIL score: {item.cibil || 590}</span>
							<ProgressBar percentage={cibilPercentage(item.cibil || 590)} />
							<span>Pre-eligibility: Rs. {item.pre_eligiblity?.case0}</span>
							<span
								className={`p-1 rounded text-center text-white text-xs w-5/12 bg-${
									item.DSCR > 2 ? 'green-500' : item.DSCR > 1.5 ? 'yellow-400' : 'red-600'
								}`}
							>
								DSCR: {item.dscr?.toFixed(2)}
							</span>
						</section>
						<section className='flex flex-col items-end gap-y-2'>
							{label
								? getBMapper(label)[1].data.map(e => (
										<Button size='small' type='blue-light' rounded='rfull' width='fulll'>
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
					/>
				)}
			</section>
		</Card>
	);
}
