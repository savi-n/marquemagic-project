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

function formatCompanyData(data) {
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
		PancardNumber: '',
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

function formatCompanyDataGST(data) {
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
		PancardNumber: '',
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
	const productType = productDetails.loanType.includes('Housing') ? 'salaried' : 'business';
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
						...formatCompanyData(companyData.data)
					});
				onProceed();
				return;
			}
		}
	};

	const [selectDoc, selectDocs] = useState(false);

	const onSubmit = async ({ panNumber, companyName, udhyogAadhar, gstNumber }) => {



		setLoading(true);


		if (productType === 'business') {
			if (isBusiness) {
				if (!formState?.values?.companyName && !formState?.values?.panNumber) {
					return;
				}


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
			...formatCompanyDataGST(companyData)
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
	const [panNum, setPan] = useState(null);
	const [isPanUploading, setIsPanUploading] = useState(false);

	const handlePanUpload = files => {

		setIsPanUploading(true)


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

				setIsPanUploading(false)


				setPan(res.data.data['Pan_number']);
				formState.values.panNumber = res.data.data['Pan_number'];
				formState.values.companyName = res.data.data['Name'];
				localStorage.setItem('formstate', JSON.stringify(formState));
				if (productType === 'business') {
					if (!res.data.data['Name'].toLowerCase().includes('private limited')) {
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

	const handleUpload = files => {
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

				console.log(res.data,"res.data")

				const name = res.data?.data?.name?.split(' ') || res.data?.data?.Name?.split(' ');
				formState.values.aadhaar = res?.data?.data?.Aadhar_number;
				formState.values.dob = res?.data?.data?.DOB || res?.data?.data?.dob;
				formState.values.firstName = name[0];
				formState.values.lastName = name[1];
				formState.values.panNumber = panNum;
				formState.values.dob = formState.values.dob;
				formState.values.dl_no = res.data?.data?.dl_no;
				formState.values.address1 = res.data?.data?.address;

				let address = formState.values.address1;


				let locationArr = address.split(' ');


				let pinCode = address.match(/\d+/)[0];

				formState.values.pin = pinCode

				localStorage.setItem('formstate', JSON.stringify(formState));
				setOtherDoc([]);
				setAadhar([]);
				setVoter([]);
				onProceed();
			}
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
										Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`
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
									name='Submit'
									isLoader={isPanUploading}
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
										Upload your DL{' '}
										<span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`
											}
										}}
										pan={true}
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e)}
										docs={otherDoc}
										setDocs={setOtherDoc}
									/>
									<p className='py-4 text-xl text-green-600'>
										Upload your Aadhar{' '}
										<span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`
											}
										}}
										pan={true}
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e)}
										docs={aadhar}
										setDocs={setAadhar}
									/>
									<p className='py-4 text-xl text-green-600'>
										Upload your Voter ID{' '}
										<span className='text-xs'>supported formats - jpeg, png, jpg</span>
									</p>

									<FileUpload
										accept=''
										upload={{
											url: DOCS_UPLOAD_URL_LOAN({
												userid
											}),
											header: {
												Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`
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
									isLoader={loading}
									name={'SUBMIT'}
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
								isLoader={false}
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
				{selectDoc && (
					<Modal>
						<section className='p-4 flex flex-col gap-y-8'>
							<span className='font-bold text-lg'>Please select doc type</span>
							<section className='flex gap-x-4 items-center'>
								<section>
									<label>DL</label>
									<input type='radio' name='doctype' value='DL' />
								</section>
								<section>
									<label>Aadhar</label>
									<input type='radio' name='doctype' value='aadhar' />
								</section>
								<section>
									<label>VoterID</label>
									<input type='radio' name='doctype' value='voter' />
								</section>
							</section>
							<Button
									name='Submit'
								fill
								onClick={() => {
									selectDocs(false);
								}}
								isLoader={false}
								disabled={!formState?.values?.panNumber}
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
