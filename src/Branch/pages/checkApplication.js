import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../components/styles/index.scss';
import { getLoanDetails, viewDocument } from '../utils/requests';
import Tabs from '../shared/components/Tabs';
import Loading from '../../components/Loading';
import Button from '../shared/components/Button';
import FileUpload from '../../shared/components/FileUpload/FileUpload';

export default function CheckApplication(props) {
	const id = props.id;
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [coApplicant, setCoApplicant] = useState(false);
	const getCoApplicantData = data => data.directors.map(e => !e.isApplicant && e);
	const getDocDetails = data => data.loan_document;
	const getPreEligibleData = data => data.eligiblityData[0]?.pre_eligiblity;
	const getBusinessData = data => data.business_id;
	const getEligibileData = data => data.eligiblityData;
	const history = useHistory();

	useEffect(() => {
		setLoading(true);
		getLoanDetails(id).then(res => {
			if (!data) setData(res);
			setLoading(false);
		});
	}, []);

	const [lActive, setLActive] = useState(props.activ);
	const [disabled, setDisabled] = useState(true);

	const tabs = [
		'Applicant',
		'Co-Applicant',
		'Document Details',
		'Security Details',
		data && getPreEligibleData(data)
			? 'Pre-Eligibility Details'
			: data && getEligibileData(data) && 'Eligibility Data',
		data && getBusinessData(data) && 'Business Data'
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

	const d = () => {
		if (data) {
			return {
				Applicant: getApplicantData(data),
				'Co-Applicant': getCoApplicantData(data),
				'Document Details': getDocDetails(data),
				'Security Details': 'No Data',
				'Pre-Eligibility Details': getPreEligibleData(data),
				'Eligibility Data': getEligibileData(data),
				'Business Data': getBusinessData(data)
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
				gender: 'Gender',
				demail: 'Email',
				dcontact: 'Contact',
				country_residence: 'Country of Residence',
				marital_status: 'Maritial Status',
				residence_status: 'Residence Status',
				daadhaar: 'Aadhar',
				dpassport: 'Passport',
				profession: 'Profession',
				dvoterid: 'Voter ID'
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
				gender: 'Gender',
				demail: 'Email',
				dcontact: 'Contact',
				country_residence: 'Country of Residence',
				marital_status: 'Maritial Status',
				residence_status: 'Residence Status',
				daadhaar: 'Aadhar',
				dpassport: 'Passport',
				profession: 'Profession',
				dvoterid: 'Voter ID'
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
		'Business Data': {
			'Business Details': {
				business_email: 'Email',
				contactno: 'Contact No',
				crime_check: 'Crime Check',
				businessname: 'Business Name',
				businesspancardnumber: 'Business Pan Number',
				businessstartdate: 'Business Start Date',
				gstin: 'GSTIN',
				businessindustry: 'Business Industry'
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
		sec_1: 'Applicant',
		sec_2: 'Co-Applicant',
		sec_3: 'Document Details',
		sec_4: 'Security Details',
		sec_5:
			data && getPreEligibleData(data)
				? 'Pre-Eligibility Details'
				: data && getEligibileData(data) && 'Eligibility Data',
		sec_6: data && getBusinessData(data) && 'Business Data'
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

	return (
		<main>
			{message && (
				<div className='absolute z-50 top-32 right-4 shadow-md p-2 rounded-md text-green-500'>
					Data Saved Successfully
				</div>
			)}
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
				<section>{data && tabs.map(e => getTabs(e))}</section>
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
											{Object.keys(mapper[e]).map(i => (
												<section>
													<p className='text-blue-700 font-medium text-xl pb-8'>{i}</p>

													<section className='flex grid grid-cols-2 gap-y-4 gap-x-20'>
														{d()[e] &&
															d()[e].map(
																j =>
																	j &&
																	Object.keys(j).map(
																		k =>
																			mapper[e][i] &&
																			Object.keys(mapper[e][i]).map(
																				l =>
																					l === k && (
																						<section className='flex space-evenly items-center'>
																							<label className='w-1/2'>
																								{mapper[e][i][k]}
																							</label>
																							<input
																								className='rounded-lg p-4 border'
																								disabled={disabled}
																								placeholder={
																									mapper[e][i][k]
																								}
																								defaultValue={j[k]}
																							/>
																						</section>
																					)
																			)
																	)
															)}
													</section>
												</section>
											))}
											<Button onClick={() => clickSub()} type='blue' rounded='rfull' size='small'>
												Submit
											</Button>
										</>
									)}

									{e === sec.sec_2 && d()[e].length > 1 ? (
										<section>
											{Object.keys(mapper[e]).map(i => (
												<section>
													{d()[e] &&
														d()[e].map(
															j =>
																j !== false && (
																	<section className='flex grid grid-cols-2 gap-y-4 gap-x-20'>
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
											<Button onClick={() => clickSub()} type='blue' rounded='rfull' size='small'>
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
											<section className='flex flex-col gap-y-5'>
												<p className='text-blue-600 font-medium text-xl'>
													Applicant Documents Uploaded
												</p>
												<FileUpload />
												<section className='flex gap-x-4'>
													{d()[e] &&
														d()[e].map((j, idx) => (
															<Button
																type='blue-light'
																onClick={() =>
																	viewDocument(j.loan, j.user_id, j.doc_name)
																}
															>
																Document {idx + 1}
															</Button>
														))}
												</section>
											</section>
											{coApplicant && (
												<section className='flex flex-col gap-y-5'>
													<p className='text-blue-600 font-medium text-xl'>
														Co-Applicant Documents Uploaded
													</p>
													<FileUpload />
												</section>
											)}
											<Button onClick={() => clickSub()} type='blue' rounded='rfull' size='small'>
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
																defaultValue={data.loan_price}
															/>
														</section>
													</section>
												))}
												<Button
													onClick={() => clickSub()}
													type='blue'
													rounded='rfull'
													size='small'
												>
													Submit
												</Button>
											</section>
											<section className='w-1/4 fixed right-0 bg-gray-200 flex flex-col gap-y-8 top-24 h-full p-6'>
												<p className='text-xl font-medium'>Comments</p>
												{props.assignmentLog && (
													<section className='bg-white flex flex-col gap-y-6 p-2 rounded-lg'>
														<span className='text-xs'>
															By:
															{
																props.usersList.data.userList.filter(
																	e => e.id === props.assignmentLog.userData.id
																)[0]?.name
															}
														</span>
														{JSON.parse(props.assignmentLog.remarks).comments}
														<span className='text-xs text-blue-700'>
															{props.assignmentLog.ints}
														</span>
													</section>
												)}
											</section>
										</section>
									)}
									{e === sec.sec_6 && (
										<section>
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
																					defaultValue={
																						mapper[e][i][k] !==
																						'Business Industry'
																							? d()[e][k]
																							: d()[e][k]['IndustryName']
																					}
																				/>
																			</section>
																		)
																)
														)}
												</section>
											))}
											<Button onClick={() => clickSub()} type='blue' rounded='rfull' size='small'>
												Submit
											</Button>
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
