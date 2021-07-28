import { useState, useRef, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { UserContext } from '../../reducer/userReducer';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import Button from '../shared/components/Button';
import { DOCS_UPLOAD_URL, DOCS_UPLOAD_URL_LOAN } from '../../_config/app.config';
import {
	getUsersList,
	reassignLoan,
	reassignLoanQuery,
	loanDocMapping,
	getApprovalStatus,
	assignUserToLoan,
	getLoanDocs,
	getCommentList,
	docTypes,
	borrowerDocUpload,
	getCase
} from '../utils/requests';

export default function SharedCAT({
	getCLicker,
	usersList,
	type,
	productId,
	item,
	lActive,
	userId,
	userToken,
	setClicked,
	submitCase,
	setAssignedBy,
	setAssignedTo
}) {
	const { newRequest } = useFetch();
	const uploadedFiles = useRef([]);
	const [users, setUsers] = useState(null);
	const [commen, setComments] = useState('');
	const [query, setQuery] = useState('');
	const [user, setUser] = useState(null);
	const [queryList, setqueryList] = useState(null);
	const [querySaved, setQuerySaved] = useState(0);
	const [compl, setCompl] = useState(null);

	useEffect(() => {
		getUsersList().then(res => {
			setUsers(res);
		});
		getCommentList(item.id).then(res => {
			if (res?.data?.message === 'No records Found') {
				setCompl(res?.data?.message);
			}
		});
	}, []);

	const [assigned, setAssigned] = useState(false);

	useEffect(() => {
		setAssignedBy(item?.assignmentLog?.userData?.name);
		setAssignedTo(
			item?.assignmentLog?.remarks &&
				usersList.filter(e => e.id === JSON.parse(item?.assignmentLog?.remarks).assignedTo)[0]?.name
		);
		setAssigned(false);
	}, [assigned]);

	useEffect(() => {
		getCommentList(item.id).then(res => {
			setqueryList(res);
		});
	}, [querySaved]);

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

	const [docType, setDocTypes] = useState(null);
	const [option, setOption] = useState([]);

	useEffect(() => {
		const arr = [];
		docTypes(item.loan_product_id, item?.Business_Type).then(res => {
			setDocTypes(res);
			if (res) {
				Object.keys(res).map(k => {
					res[k].map(p => {
						arr.push(p);
					});
				});
				setOption(arr);
			}
		});
	}, []);

	const [checkedDocs, setCheckedDocs] = useState([]);
	const [docs, setDocs] = useState([]);

	const changeHandler = value => {
		const out = option.find(d => d?.name === value);
		setCheckedDocs([...checkedDocs, out?.name]);
	};

	const removeHandler = value => {
		// console.log(value);
	};

	const upload = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload
					accept=''
					upload={{
						url: DOCS_UPLOAD_URL_LOAN({
							userid: item?.sales_id
						}),
						header: {
							Authorization: `Bearer ${localStorage.getItem('token')}`
						}
					}}
					docTypeOptions={option}
					branch={true}
					changeHandler={changeHandler}
					onRemoveFile={e => removeHandler(e)}
					docsPush={true}
					docs={docs}
					loan_id={item?.id}
					directorId={item?.directors?.[0].id}
					setDocs={setDocs}
				/>
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button
					disabled={docs.length === 0}
					type='blue'
					size='small'
					rounded='rfull'
					onClick={() => {
						borrowerDocUpload(docs).then(res => {
							setDocs([]);
						});
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

	const reconsider = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'></section>
	);

	const status = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'></section>
	);

	const reopen = () => (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'></section>
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
						submitCase && submitCase();
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
						submitCase && submitCase();
					}}
				>
					Reject
				</Button>

				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
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

	const comment_text = () => {
		if (queryList == null) {
			return null;
		}
		let leng = queryList.data ? (queryList.data.commentList ? queryList.data.commentList.length : 0) : 0;
		if (leng == 0) {
			return null;
		}
		leng = leng - 1;
		let comment = null;
		start: while (true) {
			comment = queryList.data.commentList[leng];
			if (comment.type !== 'Query') {
				leng = leng - 1;
				continue start;
			}
			break;
		}
		return comment.comment_text;
	};

	const user_name = () => {
		if (queryList == null) {
			return null;
		}
		let leng = queryList.data ? (queryList.data.commentList ? queryList.data.commentList.length : 0) : 0;
		if (leng == 0) {
			return null;
		}
		leng = leng - 1;
		let comment = null;
		start: while (true) {
			comment = queryList.data.commentList[leng];
			if (comment.type !== 'Query') {
				leng = leng - 1;
				continue start;
			}
			break;
		}
		return comment.userName;
	};

	const queries = () => {
		return (
			<section className='rounded-md flex flex-col gap-y-4 justify-center items-end z-20 bg-white pl-4 w-full'>
				{user_name() && comment_text() && (
					<section className='rounded w-11/12 self-end border p-2 focus:outline-none opacity-50 bg-gray-300'>
						<text className='font-bold'>{user_name()}</text>
						<br />
						<text>{comment_text()}</text>
					</section>
				)}

				<textarea
					placeholder='Add Comment'
					className='rounded focus:outline-none p-2 w-11/12 self-end border'
					onChange={e => setQuery(e.target.value)}
				/>

				<section className='w-full gap-x-4 self-end h-full flex justify-end'>
					<Button
						type='blue-light'
						size='small'
						rounded='rfull'
						onClick={() => {
							reassignLoanQuery(item.id, query);
							setQuerySaved(querySaved + 1);
							getCLicker(null);
						}}
					>
						Save
					</Button>
					<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
						Cancel
					</Button>
				</section>
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
						setAssigned(true);
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
				{compl}
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

	const recommendation = () => (
		<section className='rounded-md flex flex-col gap-y-4 z-20 bg-white pl-10 w-full'>
			<section className='flex flex-col items-end pl-12 gap-y-2 w-full'>
				<span className='text-sm text-start w-full'>Recommended by: {item.assignmentLog?.userData?.name}</span>
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
					onChange={e => setComments(e.target.value)}
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
							lActive === 'Pending Applications' ? 'NC In-Progress' : 'In-Progress At AO',
							commen
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
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => getCLicker(null)}>
					Cancel
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
