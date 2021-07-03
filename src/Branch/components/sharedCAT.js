import { useState, useRef, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { UserContext } from '../../reducer/userReducer';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import Button from '../shared/components/Button';
import { DOCS_UPLOAD_URL } from '../../_config/app.config';
import {
	getUsersList,
	reassignLoan,
	loanDocMapping,
	getApprovalStatus,
	assignUserToLoan,
	getLoanDocs
} from '../utils/requests';

export default function SharedCAT({ getCLicker, type, productId, item, lActive, userId, userToken, setClicked }) {
	const { newRequest } = useFetch();
	const uploadedFiles = useRef([]);
	const [users, setUsers] = useState(null);
	useEffect(() => {
		getUsersList().then(res => {
			setUsers(res.data.userList);
		});
	}, []);

	const [commen, setComments] = useState('');
	const [user, setUser] = useState(null);

	const handleFileUpload = async files => {
		Promise.all(
			files.map(file => {
				const formData = new FormData();
				formData.append('document', file);

				return newRequest(
					DOCS_UPLOAD_URL({ userId }),
					{
						method: 'POST',
						data: formData
					},
					{
						Authorization: `Bearer ${userToken}`
					}
				)
					.then(res => {
						if (res.data.status === 'ok') {
							const file = res.data.files[0];
							const uploadfile = {
								loan_id: productId,
								doc_type_id: '1',
								upload_doc_name: file.filename,
								document_key: file.fd,
								size: file.size
							};
							uploadedFiles.current = [...uploadedFiles.current, uploadfile];
						}
						return res.data.files[0];
					})
					.catch(err => err);
			})
		).then(files => console.log(files));
	};

	const upload = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload onDrop={handleFileUpload} accept='' />
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Submit
				</Button>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		</section>
	);

	const reconsider = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload onDrop={handleFileUpload} accept='' />
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		</section>
	);

	const status = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload onDrop={handleFileUpload} accept='' />
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		</section>
	);

	const reopen = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload onDrop={handleFileUpload} accept='' />
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		</section>
	);

	const approveReject = () => (
		<section className='rounded-md flex flex-col gap-y-4 z-20 bg-white pl-10 w-full'>
			<section className='flex flex-col items-end pl-12 gap-y-2 w-full'>
				<span className='text-sm text-start w-full'>Recommended by: {}</span>
				{getRecom(item.remarks) && (
					<textarea
						className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
						defaultValue={getRecom(item.remarks)}
					/>
				)}
				<input
					placeholder='ROI'
					className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
					defaultValue={item?.interest_rate?.toFixed(2)}
				/>
				<input
					placeholder='Add Recommendation'
					className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
				/>
				<select className='rounded w-full border p-2 m-2 focus:outline-none bg-transparent'>
					<option>Assign to</option>
					{users?.map(e => <option>{e.name}</option>)}
				</select>
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button
					type='blue-light'
					size='small'
					rounded='rfull'
					onClick={() => {
						reassignLoan(item.id, lActive === 'Final Sanction');
						setClicked(true);
						getCLicker(null);
					}}
				>
					Submit
				</Button>
				<Button
					type='blue-light'
					size='small'
					rounded='rfull'
					onClick={() => {
						reassignLoan(item.id, 'Rejected');
						getCLicker(null);
					}}
				>
					Reject
				</Button>
			</section>
		</section>
	);

	const download = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-center items-end z-20 bg-white pl-10 w-full'>
			<section className='rounded w-11/12 self-end border p-2 focus:outline-none opacity-50 bg-transparent'>
				No Documents
			</section>
			<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
				Cancel
			</Button>
		</section>
	);

	const approvalHistory = () => (
		<section className='rounded-md flex flex-col gap-y-4 z-20 bg-white pl-10 w-full'>
			<h1 className='font-bold'>History</h1>
			<table className='border rounded-full'>
				<thead className='border'>
					<th>Recommended By</th>
					<th>Timestamp</th>
					<th>ROI</th>
					<th>Comments</th>
				</thead>
				<tbody>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td></td>
					</tr>
				</tbody>
			</table>
		</section>
	);

	const reasonOfRejection = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<textarea contentEditable={false} defaultValue={getRecom(item.remarks)} />
		</section>
	);

	const queries = () => {
		return (
			<section className='rounded-md flex flex-col gap-y-4 justify-center items-end z-20 bg-white pl-10 w-full'>
				<section className='rounded w-11/12 self-end border p-2 focus:outline-none opacity-50 bg-transparent'>
					No Queries
				</section>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		);
	};

	const reassign = () => (
		<section className='rounded-md flex flex-col gap-y-4 z-20 bg-white pl-10 w-full'>
			<select
				className='rounded w-11/12 self-end border p-2 focus:outline-none bg-transparent'
				placeholder='Reassign to'
				onChange={e => users && users.map(el => el.name === e.target.value && setUser(el))}
			>
				<option selected disabled>
					Reassign to
				</option>
				{users && users.map(e => <option>{e.name}</option>)}
			</select>
			<textarea
				placeholder='Comments'
				className='rounded focus:outline-none p-2 w-11/12 self-end border'
				onChange={e => setComments(e.target.value)}
			/>
			<section className='w-full gap-x-4 self-end h-full flex justify-end'>
				<Button
					type='blue-light'
					size='small'
					rounded='rfull'
					onClick={() => {
						assignUserToLoan(item.id, user && user.id, commen);
						getCLicker(null);
					}}
				>
					Submit
				</Button>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
				</Button>
			</section>
		</section>
	);

	const comments = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-center items-end z-20 bg-white pl-10 w-full'>
			<section className='rounded w-11/12 self-end border p-2 focus:outline-none opacity-50 bg-transparent'>
				No Comments
			</section>
			<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
				Cancel
			</Button>
		</section>
	);

	const getRecom = data => {
		const a = JSON.parse(data);
		if (a) return a[0]?.message;
	};

	getRecom(item.remarks);

	const recommendation = () => (
		<section className='rounded-md flex flex-col gap-y-4 z-20 bg-white pl-10 w-full'>
			<section className='flex flex-col items-end pl-12 gap-y-2 w-full'>
				<span className='text-sm text-start w-full'>Recommended by: {}</span>
				{getRecom(item.remarks) && (
					<textarea
						className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
						defaultValue={getRecom(item.remarks)}
					/>
				)}
				<input
					placeholder='ROI'
					className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
					defaultValue={item?.interest_rate?.toFixed(2)}
				/>
				<input
					placeholder='Add Recommendation'
					className='resize-none rounded-lg w-full m-2 border border-silver-500 focus:outline-none p-2 text-sm'
				/>
				<select className='rounded w-full border p-2 m-2 focus:outline-none bg-transparent'>
					<option>Assign to</option>
					{users?.map(e => <option>{e.name}</option>)}
				</select>
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button
					type='blue-light'
					size='small'
					rounded='rfull'
					onClick={() => {
						reassignLoan(
							item.id,
							lActive === 'Pending Applications' ? 'NC In-Progress' : 'In-Progress At AO'
						);
						getCLicker(null);
					}}
				>
					Submit
				</Button>
				<Button
					type='blue-light'
					size='small'
					rounded='rfull'
					onClick={() => {
						reassignLoan(item.id, 'Rejected');
						getCLicker(null);
					}}
				>
					Reject
				</Button>
			</section>
		</section>
	);

	const mapper = {
		Upload: upload,
		Reconsider: reconsider,
		Status: status,
		Reopen: reopen,
		'Approve/Reject': approveReject,
		Download: download,
		'Approval History': approvalHistory,
		'Reason for Rejection': reasonOfRejection,
		Queries: queries,
		Reassign: reassign,
		Comments: comments,
		Recommendation: recommendation
	};

	return mapper[type]();
}
