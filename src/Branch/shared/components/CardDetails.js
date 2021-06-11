import { useState } from 'react';
import Card from './Card';
import Button from '../../../shared/components/Button';
import Reject from '../../components/Rejection';
import Approve from '../../components/Approve';
import Security from '../../components/Security';
import ProgressBar from './progressBar';

export default function CardDetails({ item, label, full }) {
	const [approve, setApprove] = useState(false);
	const [reject, setReject] = useState(false);
	const [security, setSecurity] = useState(false);

	const setter = d => {
		setApprove(d === 'approve');
		setReject(d === 'reject');
		setSecurity(d === 'security');
	};

	const cibilPercentage = cibil => {
		return Math.floor((Number(cibil) / 900) * 100);
	};
	return (
		<Card full={full} approve={approve} reject={reject} security={security}>
			<section>
				<section className='flex flex-col gap-y-4'>
					<section className='flex items-center items-center justify-between'>
						<section className='flex flex-col'>
							<small>{item.customer_name}</small>
							<span>
								{item.loan_type}, {item.loan_value}
							</span>
							<small>Assigned at: {item.assigned_at}</small>
						</section>
						<Button size='small' type='blue-light' rounded='rfull'>
							Check Eligibility
						</Button>
					</section>
					<hr />
					<section className='flex items-center items-center justify-between'>
						<section className='flex flex-col'>
							<span>CIBIL score: {item.cibil}</span>
							<ProgressBar percentage={cibilPercentage(item.cibil)} />
							<span>Pre-eligibility: Rs. {item.preEligibleAmount}</span>
						</section>
						<section className='flex flex-col gap-y-2'>
							<Button size='small' width='fulll' type='blue-light' rounded='rfull'>
								Pre-Eligibility
							</Button>
							<Button size='small' width='fulll' type='blue-light' rounded='rfull'>
								Add Co-Applicant
							</Button>
						</section>
					</section>
					<hr />
					<section className='flex justify-between'>
						<Button size='small' type='blue-light' rounded='rfull' onClick={() => setter('security')}>
							Create security
						</Button>
						<Button size='small' type='blue-light' rounded='rfull'>
							Upload
						</Button>
						<Button size='small' type='green-light' rounded='rfull' onClick={() => setter('approve')}>
							<span className='text-md'>✓</span>
						</Button>
						<Button size='small' type='red-light' rounded='rfull' onClick={() => setter('reject')}>
							X
						</Button>
					</section>
				</section>
				{reject && <Reject setReject={setReject} />}
				{approve && <Approve setApprove={setApprove} />}
				{security && <Security setSecurity={setSecurity} />}
			</section>
		</Card>
	);
}
