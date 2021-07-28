import { useState, useEffect } from 'react';
import '../components/styles/index.scss';
import {
	getLoanDetails,
	viewDocument,
	getLoan,
	docTypes,
	uploadDoc,
	borrowerDocUpload,
	reassignLoan,
	getGroupedDocs
} from '../utils/requests';
import Tabs from '../shared/components/Tabs';
import Loading from '../../components/Loading';
import Button from '../shared/components/Button';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DOCS_UPLOAD_URL, DOCS_UPLOAD_URL_LOAN, DOCTYPES_FETCH } from '../../_config/app.config';
import CheckBox from '../../shared/components/Checkbox/CheckBox';



export default function CheckApplication(props) {
	const checkTab = activeTab => {
		if (activeTab === 'Pending Applications' || activeTab === 'In-Progress@NC') return false;
		return true;
	};

	const [fields, setFields] = useState(null);
	const id = props.id;
	const [comment, setComment] = useState(null);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [coApplicant, setCoApplicant] = useState(false);
	const getCoApplicantData = data => data.directors.map(e => !e.isApplicant && e);
	const getDocDetails = data => data.loan_document;
	const getPreEligibleData = data => !checkTab(props.activeTab) && data.eligiblityData[0]?.pre_eligiblity;
	const getEligibileData = data => checkTab(props.activeTab) && data.eligiblityData;
	const [docType, setDocTypes] = useState(null);
	const [option, setOption] = useState([]);
	const [docsUploaded, setDocsUPloaded] = useState([]);
	const [commentSubmitted, setCommentSubmit] = useState(false);

	useEffect(() => {
		const arr = [];
		setLoading(true);
		getLoanDetails(id).then(res => {
			if (!data) setData(res);
			setLoading(false);
			if (res) {
				docTypes(props.productId, res?.business_id?.businesstype?.id).then(res => {
					setDocTypes(res);
					Object.keys(res).map(k => {
						res[k].map(p => {
							arr.push(p);
						});
					});
					setOption(arr.map(fileoption => ({ name: fileoption.name, value: fileoption.name })));
				});
				getLoan().then(resp => {
					resp.data?.map(
						k =>
							props.product.includes(k?.name) &&
							Object.keys(k.product_id).map(
								y =>
									y === res.directors[0].income_type &&
									getLoan(k.id).then(res => {
										res.length > 7 && setFields(res);
									})
							)
					);
				});
				getGroupedDocs(props.item?.loan_ref_id).then(val => setDocsUPloaded(val));
			}
		});
		if (data) {
		}
	}, []);

	const [checkedDocs, setCheckedDocs] = useState([]);
	const [docs, setDocs] = useState([]);

	const changeHandler = value => {
		const out = option.find(d => d?.name === value);
		setCheckedDocs([...checkedDocs, out?.name]);
	};

	const removeHandler = value => {
		console.log(value);
	};

	const [lActive, setLActive] = useState(props.activ);
	const [disabled, setDisabled] = useState(true);
	const [file, setFile] = useState([]);

	const handleFileUpload = (files) => {
		setFile([...files, ...file])

	}
	


	const handleDocumentTypeChange = async (fileId, type) => {
		const fileType = file.map(fi => {

			if (fi.id === fileId) {
				return { ...fi, type: type.value }
			} return fi
		})
		setFile(fileType)
	};
	const checkDocType = file.map(f =>
		f.type

	)


	const tabs = [
		props.product !== 'Unsecured Business/Self-Employed' && props.product !== 'LAP Cases'
			? 'Applicant'
			: 'Business Details',
		'Co-Applicant',
		'Document Details',
		'Security Details',
		data && getPreEligibleData(data)
			? 'Pre-Eligibility Details'
			: data && getEligibileData(data) && 'Eligibility Data'
	];

	const getTabs = item => (
		<Tabs
			k={item}
			active={lActive === item}
			click={setLActive}
			align='vertical'
			disabled={disabled}
			handleDisable={setDisabled}
			lActive={lActive}
			check={true}
		/>
	);

	const getApplicantData = data => {
		const arr = [];
		arr.push(data.directors[0]);
		data.incomeData.map(e => arr.push(e));
		return arr;
	};

	useEffect(() => {
		console.log(docs);
	}, [docs]);

	const d = () => {
		if (data) {
			return {
				Applicant: getApplicantData(data),
				'Co-Applicant': getCoApplicantData(data),
				'Document Details': getDocDetails(data),
				'Security Details': 'No Data',
				'Pre-Eligibility Details': getPreEligibleData(data),
				'Eligibility Data': getEligibileData(data),
				'Business Details': ''
			};
		}
	};

	const mapper = {
		Applicant: {
			'Personal Details': {
				dfirstname: 'First Name',
				dlastname: 'Last Name',
				dpancard: 'Pan Number',
				ddob: 'DOB',
				demail: 'Email',
				dcontact: 'Contact',
				country_residence: 'Country of Residence',
				marital_status: 'Maritial Status',
				residence_status: 'Residence Status',
				daadhaar: 'Aadhar'
			},
			'Address Details': {
				address1: 'Address 1',
				address2: 'Address 2',
				address3: 'Address 3',
				address4: 'Address 4',
				locality: 'Locality',
				city: 'City',
				state: 'State',
				pincode: 'Pincode'
			},
			'Salary Details': { gross_income: 'Gross Income', net_monthly_income: 'Net Monthly Income' },
			'EMI Details': {
				existing_personal_loan: 'Existing Personal Loan',
				existing_auto_loan: 'Existing Auto Loan',
				existing_lap_loan: 'Existing LAP Loan',
				auto_loan_bank_name: 'Auto Loan Bank',
				lap_loan_bank_name: 'LAP Loan Bank',
				personal_loan_bank_name: 'Personal Loan Bank'
			}
		},
		'Co-Applicant': {
			'Personal Details': {
				dfirstname: 'First Name',
				dlastname: 'Last Name',
				dpancard: 'Pan Number',
				ddob: 'DOB',
				demail: 'Email',
				dcontact: 'Contact',
				country_residence: 'Country of Residence',
				marital_status: 'Maritial Status',
				residence_status: 'Residence Status',
				daadhaar: 'Aadhar'
			},
			'Address Details': {
				address1: 'Address 1',
				address2: 'Address 2',
				address3: 'Address 3',
				address4: 'Address 4',
				locality: 'Locality',
				city: 'City',
				state: 'State',
				pincode: 'Pincode'
			}
		},
		'Pre-Eligibility Details': {
			'Pre-Eligible Details': {
				roi: 'ROI',
				minimumPreEligiblity: 'Eligible Amount'
			}
		},
		'Eligibility Data': {
			'Eligibility Details': {
				dscr: 'DSCR',
				financial_amt: 'Final Amount'
			}
		}
	};

	const sec = {
		sec_1:
			props.product !== 'Unsecured Business/Self-Employed' && props.product !== 'LAP Cases'
				? 'Applicant'
				: 'Business Details',
		sec_2: 'Co-Applicant',
		sec_3: 'Document Details',
		sec_4: 'Security Details',
		sec_5:
			data && getPreEligibleData(data)
				? 'Pre-Eligibility Details'
				: data && getEligibileData(data) && 'Eligibility Data'
	};

	const [message, setMessage] = useState(false);

	const clickSub = () => {
		if (!disabled) {
			setMessage(true);
			setDisabled(true);
			setTimeout(() => {
				setMessage(false);
			}, 4000);
		}
	};

	const uploader = userid => {
		uploadDoc(userid).then(res => { });
	};

	const [errorMsg, setError] = useState(false);

	const extractFields = i => {
		if (i.name === 'Loan Details') {
			i.id = 'loan-details';
		}
		if (i.name === 'Guarantor Details') {
			i.id = 'personal-details';
		}
		return i?.id;
	};

	return (
		<main>
			{message && (
				<div className='absolute bg-white z-50 top-32 right-10 shadow-md p-2 rounded-md text-green-500'>
					Data Saved Successfully
				</div>
			)}
			{errorMsg && (
				<div className='absolute z-50 top-32 right-10 shadow-md p-2 bg-white rounded-md text-red-500'>
					Error in uploading
				</div>
			)}
			<div
				onClick={() => {
					props.setViewLoan(false);
				}}
				className='absolute text-xl z-50 top-32 cursor-pointer right-4 p-2 rounded-md text-gray-400'
			>
				<FontAwesomeIcon icon={faTimes} />
			</div>
			<section
				style={{
					overflow: 'scroll',
					maxHeight: 'calc(100vh - 5.8rem)',
					height: 'calc(100vh - 5.8rem)',
					paddingLeft: '0.5rem'
				}}
				className={`scroll absolute bg-blue-700 w-1/5 py-16 flex flex-col bottom-0 ${props.home && '-mx-10'}`}
			>
				<span className='text-white font-medium text-xl pl-4 pb-6'>{props.product}</span>
				<section>{data && tabs.map(e => e !== null && getTabs(e))}</section>
			</section>
			<section
				className='absolute right-0 px-24 py-24 scroll'
				style={{
					width: '100%',
					maxWidth: 'calc(100vw - 20%)',
					maxHeight: 'calc(100vh)',
					overflow: 'scroll'
				}}
			>
				<section className='pt-32 flex flex-col pb-16 gap-y-24'>
					{data &&
						Object.keys(d()).map(e =>
							e === lActive ? (
								<>
									{e === sec.sec_1 && (
										<>
											{fields && fields.length > 7 ? (
												fields.map(
													(i, idx) =>
														i &&
														i.id !== 'guarantor-document-upload' &&
														i.id !== 'cub-document-upload' &&
														idx > 1 &&
														idx < 7 && (
															<section className='flex flex-col gap-y-4 gap-x-20'>
																<p className='text-blue-700 font-medium text-xl pb-8'>
																	{i.name}
																</p>

																{i.fields[extractFields(i)]?.data.map(
																	el =>
																		el && (
																			<section className='flex space-evenly items-center'>
																				<label className='w-1/2'>
																					{el.placeholder}
																				</label>
																				{el.type !== 'select' ? (
																					<>
																						{i.name ===
																							'Guarantor Details' &&
																							data?.directors?.map(
																								item =>
																									item.type_name ===
																									'Guarantor' && (
																										<input
																											disabled={
																												disabled
																											}
																											className='rounded-lg p-4 border w-1/3'
																											defaultValue={
																												item[
																												el
																													.db_name
																												] ||
																												'N/A'
																											}
																										/>
																									)
																							)}
																						{i.name ===
																							'Business Details' && (
																								<input
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3'
																									defaultValue={
																										data?.business_id[
																										el.db_name
																										] || 'N/A'
																									}
																								/>
																							)}

																						{i.name === 'Loan Details' && (
																							<>
																								<input
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3'
																									defaultValue={
																										data[
																										el.db_name
																										] || 'N/A'
																									}
																								/>
																							</>
																						)}
																						{i.name ===
																							'Personal Details' && (
																								<>
																									<input
																										disabled={disabled}
																										className='rounded-lg p-4 border w-1/3'
																										defaultValue={
																											data
																												?.directors[0][
																											el.db_name
																											] || 'N/A'
																										}
																									/>
																								</>
																							)}
																						{i.name === 'Address Details' &&
																							data?.business_id?.business_address.map(
																								o => (
																									<>
																										<input
																											disabled={
																												disabled
																											}
																											className='rounded-lg p-4 border w-1/3'
																											defaultValue={
																												o[
																												el
																													.db_name
																												] ||
																												'N/A'
																											}
																										/>
																									</>
																								)
																							)}

																						{i.name === 'EMI Details' &&
																							data?.loanFinancialDetails?.map(
																								o => (
																									<>
																										<input
																											disabled={
																												disabled
																											}
																											className='rounded-lg p-4 border w-1/3'
																											defaultValue={
																												o[
																													el
																														.db_name
																												]
																													? JSON.parse(
																														o[
																														el
																															.db_name
																														]
																													).map(
																														r =>
																															r[
																															el
																																.db_name
																															]
																													)
																													: 'N/A' ||
																													'N/A'
																											}
																										/>
																									</>
																								)
																							)}
																						{i.name ===
																							'Subsidiary Details' && (
																								<input
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3'
																									defaultValue={
																										data?.business_id[
																										el.db_name
																										] || 'N/A'
																									}
																								/>
																							)}
																						{i.name === 'Bank Details' &&
																							data?.loanFinancialDetails?.map(
																								o => (
																									<>
																										<input
																											disabled={
																												disabled
																											}
																											className='rounded-lg p-4 border w-1/3'
																											defaultValue={
																												o[
																												el
																													.db_name
																												] ||
																												'N/A'
																											}
																										/>
																									</>
																								)
																							)}

																						{i.name ===
																							'Shareholder Details' ? (
																							data?.businessShareData
																								.length > 0 ? (
																								data?.businessShareData.map(
																									(o, idx) => (
																										<>
																											<input
																												disabled={
																													disabled
																												}
																												className='rounded-lg p-4 border w-1/3 mx-2'
																												defaultValue={
																													o[
																													el
																														.db_name
																													] ||
																													'N/A'
																												}
																											/>
																										</>
																									)
																								)
																							) : (
																								<input
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3 mx-2'
																									defaultValue={'N/A'}
																								/>
																							)
																						) : null}
																						{i.name ===
																							'Reference Details' ? (
																							data?.loanReferenceData
																								.length > 0 ? (
																								data?.loanReferenceData.map(
																									(o, idx) => (
																										<>
																											<input
																												disabled={
																													disabled
																												}
																												className='rounded-lg p-4 border w-1/3 mx-2'
																												defaultValue={
																													o[
																													el
																														.db_name
																													] ||
																													'N/A'
																												}
																											/>
																										</>
																									)
																								)
																							) : (
																								<input
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3 mx-2'
																									defaultValue={'N/A'}
																								/>
																							)
																						) : null}
																					</>
																				) : null}

																				{el.type === 'select' && (
																					<>
																						{i.name ===
																							'Shareholder Details' &&
																							data?.businessShareData.map(
																								(o, idx) => (
																									<select
																										disabled={
																											disabled
																										}
																										className='rounded-lg p-4 border w-1/3 mx-2'
																									>
																										{el.options &&
																											el.options.map(
																												r => (
																													<option>
																														{
																															r?.name
																														}
																													</option>
																												)
																											)}
																									</select>
																								)
																							)}
																						{i.name !==
																							'Shareholder Details' && (
																								<select
																									disabled={disabled}
																									className='rounded-lg p-4 border w-1/3'
																								>
																									{el.options &&
																										el.options.map(
																											r => (
																												<option>
																													{
																														r?.name
																													}
																												</option>
																											)
																										)}
																								</select>
																							)}
																					</>
																				)}
																			</section>
																		)
																)}
															</section>
														)
												)
											) : (
												<>
													{Object.keys(mapper[e]).map(i => (
														<section>
															{d()[e] &&
																d()[e].map(
																	j =>
																		j !== false && (
																			<section className='flex flex-col gap-y-4 gap-x-20'>
																				<p className='text-blue-700 font-medium text-xl pb-8'>
																					{i}
																				</p>

																				{j &&
																					Object.keys(j).map(
																						k =>
																							mapper[e][i] &&
																							Object.keys(
																								mapper[e][i]
																							).map(
																								l =>
																									l === k && (
																										<section className='flex space-evenly items-center'>
																											<label className='w-1/2'>
																												{
																													mapper[
																													e
																													][
																													i
																													][k]
																												}
																											</label>
																											<input
																												className='rounded-lg p-4 border'
																												disabled={
																													disabled
																												}
																												placeholder={
																													mapper[
																													e
																													][
																													i
																													][k]
																												}
																												defaultValue={
																													j[k]
																												}
																											/>
																										</section>
																									)
																							)
																					)}
																			</section>
																		)
																)}
														</section>
													))}
												</>
											)}
											<Button
												onClick={() => clickSub()}
												disabled={disabled}
												type='blue'
												rounded='rfull'
												size='small'
											>
												Submit
											</Button>
										</>
									)}

									{e === sec.sec_2 &&
										d()[e].length > 1 &&
										props.product !== 'Unsecured Business/Self-Employed' &&
										props.product !== 'LAP Cases' ? (
										<section>
											{Object.keys(mapper[e]).map(i => (
												<section>
													{d()[e] &&
														d()[e].map(
															j =>
																j !== false && (
																	<section className='flex flex-col gap-y-4 gap-x-20'>
																		<p className='text-blue-700 font-medium text-xl pb-8'>
																			{i}
																		</p>

																		{j &&
																			Object.keys(j).map(
																				k =>
																					mapper[e][i] &&
																					Object.keys(mapper[e][i]).map(
																						l =>
																							l === k && (
																								<section className='flex space-evenly items-center'>
																									<label className='w-1/2'>
																										{
																											mapper[e][
																											i
																											][k]
																										}
																									</label>
																									<input
																										className='rounded-lg p-4 border'
																										disabled={
																											disabled
																										}
																										placeholder={
																											mapper[e][
																											i
																											][k]
																										}
																										defaultValue={
																											j[k]
																										}
																									/>
																								</section>
																							)
																					)
																			)}
																	</section>
																)
														)}
												</section>
											))}
											<Button
												onClick={() => clickSub()}
												disabled={disabled}
												type='blue'
												rounded='rfull'
												size='small'
											>
												Submit
											</Button>
										</section>
									) : (
										e === sec.sec_2 && (
											<section className='flex gap-x-8 items-center'>
												No Co-Applicant for this case
											</section>
										)
									)}

									{e === sec.sec_3 && (
										<>
											<section className='flex flex-col gap-y-5 w-8/12'>
												<p className='text-blue-600 font-medium text-xl'>
													Applicant Documents Uploaded
												</p>
												<FileUpload
													accept=''
													upload={{
														url: DOCS_UPLOAD_URL_LOAN({
															userid: data?.business_id?.userid
														}),
														header: {
															Authorization: `Bearer ${localStorage.getItem('token')}`
														}
													}}
													docTypeOptions={option}
													onDrop={handleFileUpload}
													documentTypeChangeCallback={handleDocumentTypeChange}
													changeHandler={changeHandler}
													onRemoveFile={e => removeHandler(e)}
													docsPush={true}
													docs={docs}
													loan_id={data?.id}
													directorId={data?.directors?.[0].id}
													setDocs={setDocs}
												/>
												<section className='flex flex-col gap-x-4 flex-wrap gap-y-4'>
													{docsUploaded.length > 0 && (
														<>
															<section>
																<span>KYC Docs</span>
																{docsUploaded.map(
																	(j, idx) =>
																		j.document_type === 'KYC Documents' && (<>
																			<section className='py-2 flex justify-evenly items-center w-full'>
																				<section className='w-full'>
																					<Button
																						type='blue-light'
																						onClick={() =>
																							viewDocument(
																								data?.id,
																								data?.directors[0]?.id,
																								j.document_fd_key
																							)
																						}
																					>
																						{console.log(j)}
																						{j.document_name}

																					</Button>
																				
																				</section>
																			</section></>
																		)
																)}
															</section>
															<section>
																<span>Financial Docs</span>
																{docsUploaded.map(
																	(j, idx) =>
																		j.document_type === 'Financial Documents' && (
																			<section className='py-2 flex justify-evenly items-center w-full'>
																				<section className='w-full'>
																					<Button
																						type='blue-light'
																						onClick={() =>
																							viewDocument(
																								data?.id,
																								j.uploadedBy,
																								j.document_fd_key
																							)
																						}
																					>
																						{j.document_name}
																					</Button>
																				</section>
																			</section>
																		)
																)}
															</section>
															<section>
																<span>Other Docs</span>
																{docsUploaded.map(
																	(j, idx) =>
																		j.document_type === 'Other Documents' && (
																			<section className='py-2 flex justify-evenly items-center w-full'>
																				<section className='w-full'>
																					<Button
																						type='blue-light'
																						onClick={() =>
																							viewDocument(
																								data?.id,
																								j.uploadedBy,
																								j.document_fd_key
																							)
																						}
																					>
																						{j.document_name}
																					</Button>
																				</section>
																			</section>
																		)
																)}
															</section>
														</>
													)}
												</section>
											</section>
											{docType && (
												<section className='fixed overflow-scroll z-10 right-0 w-1/4 bg-gray-200 p-4 h-full top-24 py-16'>
													{Object.keys(docType).map(el => (
														<section className='py-6'>
															<p className='font-semibold'>{el}</p>
															{docType[el].map(doc => (
																<section>
																	<CheckBox
																		name={doc.name}
																		round
																		disabled
																		bg='green'
																		checked={checkDocType.includes(doc.name)}
																	/>
																</section>
															))}
														</section>
													))}
												</section>
											)}
											{coApplicant && (
												<section className='flex flex-col gap-y-5'>
													<p className='text-blue-600 font-medium text-xl'>
														Co-Applicant Documents Uploaded
													</p>
													<FileUpload />
												</section>
											)}
											<Button
												onClick={() => {
													borrowerDocUpload(docs).then(res => {
														if (res === 'Error in uploading') {
															setError(true);
															setTimeout(() => {
																setError(false);
															}, 4000);
														} else {
															setMessage(true);
															setTimeout(() => {
																setMessage(false);
															}, 4000);
															setDocs([]);
														}
													});
												}}
												disabled={docs.length === 0 ? true : false}
												type='blue'
												rounded='rfull'
												size='small'
											>
												Submit
											</Button>
										</>
									)}
									{e === sec.sec_4 && (
										<section>
											<p>No collateral details found</p>
										</section>
									)}
									{e === sec.sec_5 && (
										<section className='w-full flex'>
											<section className='w-1/2'>
												{Object.keys(mapper[e]).map(i => (
													<section>
														<p className='text-blue-700 font-medium text-xl pb-8'>{i}</p>
														{d()[e] &&
															Object.keys(d()[e]).map(
																k =>
																	mapper[e][i] &&
																	Object.keys(mapper[e][i]).map(
																		l =>
																			l === k && (
																				<section className='flex space-evenly py-2 items-center'>
																					<label className='w-1/2'>
																						{mapper[e][i][k]}
																					</label>
																					<input
																						className='rounded-lg p-4 border'
																						disabled={disabled}
																						placeholder={mapper[e][i][k]}
																						defaultValue={d()[e][k]}
																					/>
																				</section>
																			)
																	)
															)}
														<section className='flex space-evenly py-2 items-center'>
															<label className='w-1/2'>Loan Amount</label>
															<input
																className='rounded-lg p-4 border'
																disabled={disabled}
																defaultValue={data?.loan_price}
															/>
														</section>
														<section className='flex space-evenly py-2 items-center'>
															<label className='w-1/2'>DSCR</label>
															<input
																className='rounded-lg p-4 border'
																disabled={disabled}
																placeholder='DSCR'
																defaultValue={Number(props?.item?.dscr).toFixed(2)}
															/>
														</section>
														<section className='flex space-evenly py-2 items-center'>
															<label className='w-1/2'>Tenure</label>
															<input
																className='rounded-lg p-4 border'
																disabled={disabled}
																placeholder='Tenure'
																defaultValue={props?.item?.applied_tenure}
															/>
														</section>
														<section className='flex space-evenly py-2 items-center'>
															<label className='w-1/2'>Income</label>
															<input
																className='rounded-lg p-4 border'
																disabled={disabled}
																placeholder='Tenure'
																defaultValue={
																	props.item?.net_monthly_income ||
																	props.item?.gross_income
																}
															/>
														</section>
													</section>
												))}
												<Button
													onClick={() => clickSub()}
													type='blue'
													rounded='rfull'
													size='small'
													disabled={disabled}
												>
													Submit
												</Button>
											</section>
											<section className='w-1/4 overflow-y-auto overflow-scroll scroll right-0 bg-gray-200 flex flex-col gap-y-8 top-24 fixed h-full p-6'>
												<p className='text-xl font-medium'>Comments</p>
												{(props.assignmentLog || data?.remarks) && (
													<>
														{Object.keys(
															JSON.parse(props.assignmentLog || data?.remarks)
														).map(el => (
															<section className='bg-white flex flex-col gap-y-6 p-2 rounded-lg'>
																<span className='text-xs'>
																	
																	{
																		JSON.parse(
																			props.assignmentLog || data?.remarks
																		)[el]?.name
																	}
																</span>
																{
																	JSON.parse(props.assignmentLog || data?.remarks)[el]
																		?.type === ( 'Comments') &&
																	JSON.parse(props.assignmentLog || data?.remarks)[el]
																		?.message}
																<span className='text-xs text-blue-700'>
																	{el || el.message}
																</span>
															</section>
														))}
													</>
												)}
												<section className='flex gap-x-2 overflow-scroll scroll items-center justify-between'>
													{commentSubmitted ? (
														<input
															placeholder='Add Comment'
															className='p-1 rounded-md px-2 focus:outline-none'
															onChange={e => setComment(e.target.value)}
															value=''
														/>
													) : (
														<input
															placeholder='Add Comment'
															className='p-1 rounded-md px-2 focus:outline-none'
															onChange={e => setComment(e.target.value)}
														/>
													)}

													<Button
														type='blue-light'
														size='small'
														rounded='rfull'
														onClick={() => {
															reassignLoan(props.item.id, null, comment);
															setMessage(true);
															setTimeout(() => {
																setMessage(false);
															}, 4000);

															setCommentSubmit(true);
														}}
													>
														<p className="focus: text-xs"> Add Comment</p>

													</Button>
												</section>
											</section>
										</section>
									)}
								</>
							) : (
								''
							)
						)}
				</section>

				{loading && !data && (
					<section className='w-1/2 flex justify-center items-center'>
						<Loading />
					</section>
				)}
			</section>
		</main>
	);
}
