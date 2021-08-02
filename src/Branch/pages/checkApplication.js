import { useState, useEffect, useContext } from 'react';
import '../components/styles/index.scss';
import {
	getLoanDetails,
	getLoan,
	docTypes,
	uploadDoc,
	reassignLoan,
	// getGroupedDocs,
	viewDocument,
	borrowerDocUpload,
	verification
} from '../utils/requests';
import Tabs from '../shared/components/Tabs';
import Loading from '../../components/Loading';
import Button from '../shared/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import CollateralsDetails from '../components/CollateralsDetails';
import ApplicantDetails from '../components/ApllicantDetails';
import EligibilitySection from '../components/EligibilitySection';
import DocumentUploadSection from '../components/DocumentUploadSection';
import useCaseUpdate from '../useCaseUpdate';
import { AppContext } from '../../reducer/appReducer';
// import { YAxis } from "recharts";

export default function CheckApplication(props) {
	const checkTab = activeTab => {
		if (activeTab === 'Pending Applications' || activeTab === 'In-Progress@NC') return false;
		return true;
	};

	const [fields, setFields] = useState(null);
	const [comment, setComment] = useState(null);
	const [coApplicant, setCoApplicant] = useState(false);
	const getCoApplicantData = data => data.directors.map(e => !e.isApplicant && e);
	const getDocDetails = data => data.loan_document;
	const getPreEligibleData = data => !checkTab(props.activeTab) && data.eligiblityData[0]?.pre_eligiblity;
	const getEligibileData = data => checkTab(props.activeTab) && data.eligiblityData;
	const [docType, setDocTypes] = useState(null);
	const [option, setOption] = useState([]);
	const [docsUploaded, setDocsUPloaded] = useState([]);
	const [data, setData] = useState(null);
  const [savedCollateral, setSavedCollateral] = useState(null);
  const [initialCollateral, setInitialCollateral] = useState(null);
  const [collateralFlag, setCollateralFlag] = useState("null");

	//changes
	const [loading, setLoading] = useState(false);
	const [loanDetailsState, setLoanDetailsState] = useState(null);
	const {
		state: { bankToken, clientToken }
	} = useContext(AppContext);

	const id = props.id;
	const [verificationData, setVerificationData] = useState(null);

	useEffect(() => {
		const arr = [];
		setLoading(true);
		getLoanDetails(id).then(loanDetails => {
			if (loanDetails) {
				setLoanDetailsState(loanDetails);
				setData(loanDetails);
			}
			setLoading(false);

			if (loanDetails) {
				verification(loanDetails?.business_id?.id, clientToken).then(respo => {
					setVerificationData(respo.data.data);
				});
				docTypes(props.productId, loanDetails?.business_id?.businesstype?.id).then(res => {
					setDocTypes(res);
					Object.keys(res).map(k => {
						res[k].map(p => {
							arr.push(p);
						});
					});
					setOption(
						arr.map(fileoption => ({
							main: fileoption.doc_type,
							name: fileoption.name,
							value: fileoption.doc_type_id
						}))
					);
				});
				getLoan().then(resp => {
					resp.data?.map(
						k =>
							props.product.includes(k?.name) &&
							Object.keys(k.product_id).map(
								y =>
									y === loanDetails.directors[0].income_type &&
									getLoan(k.id).then(res => {
										res.length > 7 && setFields(res);
									})
							)
					);
				});
				// getGroupedDocs(props.item?.loan_ref_id).then((val) =>
				//   setDocsUPloaded(val)
				// );

        if (loanDetails?.collateralData) {
          if (loanDetails.collateralData?.modified_collateral) {
            setSavedCollateral(loanDetails.collateralData?.modified_collateral);
            setCollateralFlag("saved");
          } else if (loanDetails?.collateralData?.saved_collateral) {
            setSavedCollateral(loanDetails.collateralData?.saved_collateral);
            setCollateralFlag("saved");
          }else if (loanDetails.collateralData?.initial_collateral && loanDetails.collateralData?.initial_collateral.length > 0 ) {
            setInitialCollateral(loanDetails.collateralData.initial_collateral);
            setCollateralFlag("initial");
          }
        }
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

	const tabs = [
		props.product !== 'Unsecured Business/Self-Employed' && props.product !== 'LAP Cases'
			? 'Applicant'
			: 'Business Details',
		'Co-Applicant',
		'Document Details',
		'Security Details',
		data && getPreEligibleData(data) ? 'Pre-Eligibility Details' : data && 'Eligibility Details',
		'Verification Details'
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

	// useEffect(() => {
	//   console.log(docs);
	// }, [docs]);

	const d = () => {
		if (data) {
			return {
				Applicant: getApplicantData(data),
				'Co-Applicant': getCoApplicantData(data),
				'Document Details': getDocDetails(data),
				'Security Details': 'No Data',
				'Pre-Eligibility Details': getPreEligibleData(data),
				'Eligibility Details': getEligibileData(data),
				'Business Details': '',
				'Verification Details': ''
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
			'Salary Details': {
				gross_income: 'Gross Income',
				net_monthly_income: 'Net Monthly Income'
			},
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
		'Eligibility Details': {
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
				: data && getEligibileData(data) && 'Eligibility Details'
	};
	const coApp = [];
	const coApplicantIds = data?.directors.map(
		director =>
			(director.type_name === 'Co-Applicant' || director.type_name === 'Guarantor') && coApp.push(director.id)
	);

	const cooap = data => {
		return data?.directors.filter(e => (e.type_name === 'Co-Applicant' || e.type_name === 'Guarantor') && e.id);
	};

	const App = [];
	const ApplicantIds = data?.directors.map(director => director.type_name === 'Applicant' && App.push(director.id));

	const ap = data => {
		return data?.directors.filter(e => e.type_name === 'Applicant' && e.id);
	};

	console.log(cooap(data));

	const [message, setMessage] = useState(false);

	const { caseUpdateInit } = useCaseUpdate();
	const clickSub = async () => {
		if (!disabled) {
			await caseUpdateInit(formValues, localStorage.getItem('token') || '');
			setMessage(true);
			setDisabled(true);
			setTimeout(() => {
				setMessage(false);
			}, 4000);
		}
	};

	const uploader = userid => {
		uploadDoc(userid).then(res => {});
	};

	const [errorMsg, setError] = useState(false);

	const [file, setFile] = useState([]);

	const handleFileUpload = files => {
		setFile([...files, ...file]);
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		const fileType = file.map(fi => {
			if (fi.id === fileId) {
				return {
					...fi,
					type: type.name,
					name: type.name,
					doc_type_id: type.value
				};
			}
			return fi;
		});
		setFile(fileType);
	};
	const checkDocType = file.map(f => f.type);

	const [formValues, setFormValues] = useState({});
	const onfieldChanges = e => {
		const { name, value } = e.target;
		setFormValues({ ...formValues, [name]: value });
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
				onClick={() => props.setViewLoan(false)}
				className='absolute text-xl z-50 top-32 cursor-pointer right-4 p-2 rounded-md text-gray-400'
			>
				<FontAwesomeIcon icon={faTimes} />
			</div>

			{/* left */}
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

			{/* right */}
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
					{/* content for active tab */}
					{data &&
						Object.keys(d()).map(e =>
							e === lActive ? (
								<>
									{e === sec.sec_1 && (
										<ApplicantDetails
											fields={fields}
											disabled={disabled}
											onfieldChanges={onfieldChanges}
											data={data}
											mapper={mapper}
											e={e}
											d={d}
											clickSub={clickSub}
										/>
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
																		<p className='text-blue-700 font-medium text-xl pb-8 p1'>
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
										<DocumentUploadSection
											item={props?.item}
											userToken={localStorage.getItem('token')}
											loanData={data}
											option={option}
											handleFileUpload={handleFileUpload}
											file={file}
											handleDocumentTypeChange={handleDocumentTypeChange}
											changeHandler={changeHandler}
											removeHandler={removeHandler}
											docs={docs}
											setDocs={setDocs}
											docsUploaded={docsUploaded}
											App={App}
											viewDocument={viewDocument}
											docType={docType}
											checkDocType={checkDocType}
											cooap={cooap}
											coApp={coApp}
											setError={setError}
											setMessage={setMessage}
											borrowerDocUpload={borrowerDocUpload}
										/>
									)}
									{e === sec.sec_4 && (
										<section>{
                      collateralFlag === 'saved' ?
                      <CollateralsDetails 
                        savedCollateral={savedCollateral} 
                        loanId={props?.item?.id}
                        product={props.product}
                        disabled={disabled}
                        setViewLoan={props.setViewLoan}/> 
                      : collateralFlag === 'initial' ? <CollateralsDetails 
                      initialCollateral={initialCollateral} 
                      loanId={props?.item?.id}
                      product={props.product}
                      disabled={disabled}
                      setViewLoan={props.setViewLoan}/>:<CollateralsDetails
                        loanId={props?.item?.id}
                        product={props.product}
                        disabled={disabled}
                        setViewLoan={props.setViewLoan}
                      />
                      }
											
										</section>
									)}
									{e === sec.sec_5 && (
										<EligibilitySection
											disabled={disabled}
											onfieldChanges={onfieldChanges}
											data={data}
											mapper={mapper}
											item={props?.item}
											clickSub={clickSub}
											assignmentLog={props?.assignmentLog}
											setComment={setComment}
											reassignLoan={reassignLoan}
											comment={comment}
                      setError={setError}
											setMessage={setMessage}
											e={e}
											d={d}
										/>
									)}
									{e === 'Verification Details' && (
										<section>
											{verificationData &&
												Object.keys(verificationData).map(e => (
													<section className='flex flex-col gap-y-6'>
														<section>{e}</section>
														<section className='pb-16'>
															{verificationData[e] &&
																verificationData[e].length > 0 &&
																verificationData[e][0] !== null &&
																Object.keys(JSON.parse(verificationData[e])).map(l => (
																	<section className='flex w-1/2 items-center gap-x-6 px-10 justify-evenly'>
																		<section className='w-1/2'>{l}</section>
																		<section className='w-1/2'>
																			{typeof JSON.parse(verificationData[e])[
																				l
																			] !== 'object' &&
																				JSON.parse(verificationData[e])[l]}
																		</section>
																	</section>
																))}
														</section>
													</section>
												))}
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
