import { useState, useContext, useEffect } from 'react';
import { func, object, oneOfType, string } from 'prop-types';
import styled from 'styled-components';

import Button from '../../../components/Button';
import {
	ROC_DATA_FETCH,
	LOGIN_CREATEUSER,
	WHITELABEL_ENCRYPTION_API,
	SEARCH_COMPANY_NAME,
	NC_STATUS_CODE,
	APP_CLIENT,
	DOCS_UPLOAD_URL_LOAN
} from '../../../_config/app.config';
import { AppContext } from '../../../reducer/appReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import { useToasts } from '../../../components/Toast/ToastProvider';
import CompanySelectModal from '../../../components/CompanySelectModal';
import FileUpload from '../../../shared/components/FileUpload/FileUpload';
import { getKYCData, verifyPan, gstFetch } from '../../../utils/request';
import Modal from '../../../components/Modal';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
`;

const Colom2 = styled.div`
	width: 30%;
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 50%;
`;

const H2 = styled.h2`
	width: 50%;
	text-align: center;
	font-weight: 500;
`;

const businessTypeMaps = [[['private', 'pvt'], 4], [['public', 'pub'], 5], [['llp'], 3]];

function formatCompanyData(data, panNum) {
	let directors = {};
	let directorsForShow = [];

	for (const [i, dir] of data['directors/signatory_details']?.entries() || []) {
		directors[`directors_${i}`] = {
			[`ddin_no${i}`]: dir['din/pan']
		};
		directorsForShow.push({
			Name: dir.assosiate_company_details?.director_data.name,
			Din: dir.assosiate_company_details?.director_data.din
		});
	}

	let businesType;

	for (const type of businessTypeMaps) {
		const typeAllowed = type[0].find(t => data.company_master_data.company_name.toLowerCase().includes(t));

		if (typeAllowed) {
			businesType = type[1];
			break;
		}
	}

	const [date, month, year] = data.company_master_data.date_of_incorporation.split(/\/|-/);

	return {
		BusinessName: data.company_master_data.company_name,
		BusinessType: businesType,
		Email: data.company_master_data.email_id,
		BusinessVintage: `${year}-${month}-${date}`, //1990-03-16
		panNumber: panNum,
		CIN: data.company_master_data['cin '],
		CompanyCategory: data.company_master_data.company_category,
		Address: data.company_master_data.registered_address,
		ClassOfCompany: data.company_master_data.class_of_company,
		RegistrationNumber: data.company_master_data.registration_number,
		DirectorDetails: directors,
		directorsForShow,
		unformatedData: data
	};
}

function formatCompanyDataGST(data, panNum) {
	if (data.length > 1) data = data[0].data;
	let directors = {};
	let directorsForShow = [];

	directorsForShow.push({
		Name: data.lgnm,
		Din: ''
	});

	let businesType;

	for (const type of businessTypeMaps) {
		const typeAllowed = type[0].find(t => data.tradeNam?.toLowerCase().includes(t));

		if (typeAllowed) {
			businesType = type[1];
			break;
		}
	}

	const [date, month, year] = data.rgdt.split(/\/|-/);

	return {
		BusinessName: data.tradeNam,
		BusinessType: businesType,
		Email: '',
		BusinessVintage: `${year}-${month}-${date}`, //1990-03-16
		panNumber: panNum,
		CIN: '',
		CompanyCategory: data.nba[0],
		Address: data.pradr?.addr,
		ClassOfCompany: data.ctb,
		RegistrationNumber: data.ctjCd,
		DirectorDetails: directors,
		directorsForShow,
		unformatedData: data
	};
}

export default function PanVerification({ productDetails, map, onFlowChange, id }) {
	const productType =
		productDetails.loanType.includes('Business') || productDetails.loanType.includes('LAP')
			? 'business'
			: 'salaried';
	const {
		state: { whiteLabelId, clientToken, bankToken }
	} = useContext(AppContext);

	const {
		actions: { setCompanyDetails }
	} = useContext(BussinesContext);

	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();

	const { addToast } = useToasts();

	const [loading, setLoading] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const [companyListModal, setCompanyListModal] = useState(false);

	const onCompanySelect = cinNumber => {
		setCompanyListModal(false);
		setLoading(true);
		cinNumberFetch(cinNumber);
	};

	const [panNum, setPan] = useState('');

	const companyNameSearch = async companyName => {
		setLoading(true);
		const companyNameSearchReq = await newRequest(
			SEARCH_COMPANY_NAME,
			{
				method: 'POST',
				data: {
					search: companyName
				}
			},
			{}
		);

		const companyNameSearchRes = companyNameSearchReq.data;

		if (companyNameSearchRes.status === NC_STATUS_CODE.OK) {
			setCompanyListModal(true);
			setCompanyList(companyNameSearchRes.data);
		}
	};

	const cinNumberFetch = async cinNumber => {
		const cinNumberResponse = await newRequest(
			ROC_DATA_FETCH,
			{
				method: 'POST',
				data: {
					cin_number: cinNumber
				}
			},
			{ authorization: clientToken }
		);

		const companyData = cinNumberResponse.data;

		if (companyData.status === NC_STATUS_CODE.OK) {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: {
					email: companyData.data.company_master_data.email_id,
					white_label_id: whiteLabelId,
					source: APP_CLIENT,
					name: companyData.data.company_master_data.company_name,
					mobileNo: '9999999999',
					addrr1: '',
					addrr2: ''
				}
			});

			const userDetailsRes = userDetailsReq.data;

			if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
				const encryptWhiteLabelReq = await newRequest(
					WHITELABEL_ENCRYPTION_API,
					{
						method: 'GET'
					},
					{ Authorization: `Bearer ${userDetailsRes.token}` }
				);

				const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

				if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
					setCompanyDetails({
						token: userDetailsRes.token,
						userId: userDetailsRes.userId,
						branchId: userDetailsRes.branchId,
						encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
						...formatCompanyData(companyData.data, panNum)
					});
				onProceed();
				return;
			}
		}
	};

	const [selectDoc, selectDocs] = useState(false);

	const onSubmit = async ({ panNumber, companyName, udhyogAadhar, gstNumber }) => {
		console.log(productType);
		if (productType === 'business') {
			if (isBusiness) {
				if (!formState?.values?.companyName && !formState?.values?.panNumber) {
					return;
				}

				setLoading(true);

				try {
					if (formState?.values?.panNumber) {
						await verifyPan(response?.Info?.id, panNumber, clientToken);
					}

					if (formState?.values?.companyName) {
						await companyNameSearch(formState?.values?.companyName);
					}
				} catch (error) {
					console.error(error);
					addToast({
						message: error.message || 'Something Went Wrong. Try Again!',
						type: 'error'
					});
				}
			} else {
				localStorage.setItem('product', 'demo');

				if (!udhyogAadhar && !panNumber) {
					return;
				}

				setLoading(true);

				try {
					if (udhyogAadhar) {
						await verifyPan(response?.Info?.id, udhyogAadhar, clientToken);
					}

					if (panNumber) {
						await gstFetch(panNumber, clientToken).then(res => {
							gstNumberFetch(res.data.data);
						});
					}
				} catch (error) {
					console.error(error);
					addToast({
						message: error.message || 'Something Went Wrong. Try Again!',
						type: 'error'
					});
				}
			}
		} else {
			console.log(aadhar, voter, otherDoc);
			if (aadhar.length > 0) {
				handleUpload(aadhar[0].file);
			}
			if (voter.length > 0) {
				handleUpload(voter[0].file);
			}
			if (otherDoc.length > 0) {
				handleUpload(otherDoc[0].file);
			}
		}
		setLoading(false);
	};

	const gstNumberFetch = async data => {
		const companyData = data;
		setCompanyDetails({
			...formatCompanyDataGST(companyData, panNum)
		});
		onProceed();
		return;
	};

	const onProceed = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	const [panUpload, setPanUpload] = useState(true);
	const [file, setFile] = useState([]);
	const [docs, setDocs] = useState([]);
	const [dataSelector, setDataSelector] = useState(false);
	const [selectedData, setData] = useState(null);
	const [response, setResponse] = useState(null);
	const [isBusiness, setBusiness] = useState(true);

	const handleFileUpload = files => {
		setFile([...files, ...file]);
	};

	useEffect(() => {
		localStorage.removeItem('product');
	}, []);

	const userid = '10626';
	const removeHandler = e => {
		setDocs([]);
	};

	const [openConfirm, setPanConfirm] = useState(false);
	const [uploadOtherDocs, setUploadOtherDocs] = useState(false);
	const [otherDoc, setOtherDoc] = useState([]);
	const [aadhar, setAadhar] = useState([]);
	const [voter, setVoter] = useState([]);
	const [selectedDocType, setSelectedDocType] = useState(null);
	

	const handlePanUpload = files => {
		setLoading(true);
		const formData = new FormData();
		formData.append('req_type', 'pan');
		formData.append('process_type', 'extraction');
		formData.append('document', files);

		getKYCData(formData, clientToken).then(res => {
			if (res.data.status === 'nok') {
				if (productType === 'salaried') {
					setPanConfirm(true);
				}
				addToast({
					message: res.data.message,
					type: 'error'
				});
			} else {
				setPan(res.data.data['Pan_number']);
				localStorage.getItem('pan', res.data.data['Pan_number']);
				formState.values.panNumber = res.data.data['Pan_number'];
				formState.values.companyName = res.data.data['Name'];
				formState.values.dob = res.data.data['DOB'];
				localStorage.getItem('DOB', res.data.data['DOB']);
				localStorage.setItem('formstatepan', JSON.stringify(formState));
				if (productType === 'business') {
					if (
						!(
							res.data.data['Name'].toLowerCase().includes('private limited') ||
							res.data.data['Name'].toLowerCase().includes('public limited') ||
							res.data.data['Name'].toLowerCase().includes('limited') ||
							res.data.data['Name'].toLowerCase().includes('pvt ltd')
						)
					) {
						setBusiness(false);
						setPanUpload(false);
					} else {
						onSubmit(formState);
					}
				}
				if (productType === 'salaried') {
					setPanConfirm(true);
				}
				setResponse(res.data);
			}
			setLoading(false);
		});
	};

	function formatUserDetails(data, fields) {
		let formatedData = {};
		fields.forEach(f => {
			formatedData[f.name] = data[f.name] || '0';
		});
		return formatedData;
	}

	const t = () => {
		if (otherDoc.length > 0) {
			return 'DL';
		}
		if (aadhar.length > 0) {
			return 'aadhar';
		}
		if (voter.length > 0) {
			return 'voter';
		}
	};
	const [backUpload, setBackUpload] = useState(false);
	const [backUploading, setBackUploading] = useState(false);

	useEffect(() => {
		if (aadhar.length > 0 || voter.length > 0 || otherDoc.length > 0) setBackUpload(true);
	}, [otherDoc, aadhar, voter]);

	const handleUpload = files => {
		setLoading(true);
		const fileType = t();
		const formData = new FormData();
		formData.append('req_type', fileType);
		formData.append('process_type', 'extraction');
		formData.append('document', files);
		getKYCData(formData, clientToken).then(res => {
			if (res.data.status === 'nok') {
				addToast({
					message: res.data.message,
					type: 'error'
				});
			} else {
				const name = res.data?.data?.name?.split(' ') || res.data?.data?.Name?.split(' ');
				formState.values.aadhaar = res?.data?.data?.Aadhar_number?.replaceAll(/\s/g, '');
				localStorage.setItem('aadhar', res?.data?.data?.Aadhar_number?.replaceAll(/\s/g, ''));
				formState.values.dob = res?.data?.data?.DOB;
				formState.values.firstName = name[0];
				formState.values.lastName = name[1];
				formState.values.panNumber = panNum;
				localStorage.setItem('formstate', JSON.stringify(formState));
				setOtherDoc([]);
				setAadhar([]);
				setVoter([]);
				onProceed();
			}
			setLoading(false);
		});
	};

	return (
		productDetails && (
			<>
				<Colom1>
					{panUpload ? (
						<section className='flex flex-col gap-y-6'>
							<p className='py-4 text-xl text-green-600'>
								Upload your PAN Card <span className='text-xs'>supported formats - jpeg, png, jpg</span>
							</p>
							<FileUpload
								accept=''
								upload={{
									url: DOCS_UPLOAD_URL_LOAN({
										userid
									}),
									header: {
										Authorization: `Bearer ${clientToken}`
									}
								}}
								pan={true}
								onDrop={handleFileUpload}
								onRemoveFile={e => removeHandler(e)}
								docs={docs}
								setDocs={setDocs}
							/>
							<section>
								<Button
									onClick={() => {
										if (docs.length > 0) {
											handlePanUpload(docs[0].file);
											setDocs([]);
										}
									}}
									name={loading ? 'Please wait' : 'Submit'}
									disabled={!docs.length > 0}
									fill
								/>
							</section>
						</section>
					) : (
						<form onSubmit={handleSubmit(onSubmit)}>
							
							{uploadOtherDocs ? (
								<>
									<p className='py-4 text-xl text-green-600'>
										Upload {(backUploading && 'back picture of') || 'front picture of'} your DL{' '}
										<span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer ${clientToken}`
											}
										}}
										pan={true}
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e)}
										docs={otherDoc}
										setDocs={setOtherDoc}
									/>
									<p className='py-4 text-xl text-green-600'>
										Upload {(backUploading && 'back picture of') || 'front picture of'} your Aadhar{' '}
										<span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer ${clientToken}`
											}
										}}
										pan={true}
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e)}
										docs={aadhar}
										setDocs={setAadhar}
									/>
									<p className='py-4 text-xl text-green-600'>
										Upload {(backUploading && 'back picture of') || 'front picture of'} your Voter
										ID <span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer ${clientToken}`
											}
										}}
										pan={true}
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e)}
										docs={voter}
										setDocs={setVoter}
									/>
								</>
							) : (
								<>
									<FieldWrapper>
										{register({
											name: 'panNumber',
											placeholder: 'PAN Number',
											value: formState?.values?.panNumber
										})}
									</FieldWrapper>
									
									<H2>or</H2>
									<FieldWrapper>
										{register({
											name: 'udhyogAadhar',
											placeholder: 'Udhyog Aadhar Number',
											value: formState?.values?.udhyogAadhar
										})}
									</FieldWrapper>
								</>
							)}
							<section className='flex items-center gap-x-4'>
								<Button onClick={() => setPanUpload(true)} name='Upload PAN again' fill />
								<Button
									type='submit'
									name={loading ? 'Please wait...' : 'SUBMIT'}
									fill
									disabled={
										productType !== 'salaried'
											? isBusiness
												? !(formState.values?.companyName || formState.values?.panNumber) ||
												  (formState.values?.companyName && formState.values?.panNumber)
												: !(formState.values?.udhyogAadhar || formState.values?.panNumber) ||
												  (formState.values?.udhyogAadhar && formState.values?.panNumber) ||
												  loading
											: false
									}
								/>
							</section>
						</form>
					)}
				</Colom1>
				<Colom2>
					<Img src={productDetails.productDetailsImage} alt='Loan Caption' />
				</Colom2>
				{
					<CompanySelectModal
						show={companyListModal}
						companyList={companyList}
						onClose={() => setCompanyListModal(false)}
						onCompanySelect={onCompanySelect}
					/>
				}
				{openConfirm && productType === 'salaried' && (
					<Modal
						show={openConfirm}
						onClose={() => {
							setPanConfirm(false);
						}}
						width='30%'
					>
						<section className='p-4 flex flex-col gap-y-8'>
							<span className='font-bold text-lg'>Please confirm your PAN Number</span>
							<section className='flex gap-x-4 items-center'>
								<FieldWrapper>
									{register({
										name: 'panNumber',
										placeholder: 'Pan Number',
										value: formState?.values?.panNumber
									})}
								</FieldWrapper>
							</section>
							<Button
								name='Submit'
								fill
								onClick={() => {
									setPanConfirm(false);
									setPanUpload(false);
									setUploadOtherDocs(true);
								}}
								disabled={!formState?.values?.panNumber}
							/>
						</section>
					</Modal>
				)}
				{backUpload &&
					!panUpload &&
					(aadhar.length > 0 || otherDoc.length > 0 || voter.length > 0) &&
					!backUploading && (
						<Modal
							show={backUpload}
							onClose={() => {
								setBackUpload(false);
							}}
							width='30%'
						>
							<span className='px-4 font-bold'>Upload back part of the document?</span>
							<section className='p-4 py-16 flex gap-x-8'>
								<Button
									name='Yes'
									fill
									onClick={() => {
										setBackUploading(true);
										setBackUpload(false);
										setAadhar([]);
										setVoter([]);
										setOtherDoc([]);
									}}
								/>
								<Button
									name='No'
									fill
									onClick={() => {
										setBackUpload(false);
									}}
								/>
							</section>
						</Modal>
					)}
			</>
		)
	);
}

PanVerification.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string
};
