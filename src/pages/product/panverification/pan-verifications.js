import { useState, useContext, useEffect, useRef } from 'react';
import { func, object, oneOfType, string } from 'prop-types';
import styled from 'styled-components';
import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import { AppContext } from '../../../reducer/appReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import CompanySelectModal from '../../../components/CompanySelectModal';
import FileUpload from '../../../shared/components/FileUpload/FileUpload';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import {
	ROC_DATA_FETCH,
	LOGIN_CREATEUSER,
	WHITELABEL_ENCRYPTION_API,
	SEARCH_COMPANY_NAME,
	NC_STATUS_CODE,
	APP_CLIENT,
	//DOCS_UPLOAD_URL_LOAN,
	// PINCODE_ADRRESS_FETCH,
} from '../../../_config/app.config';
import {
	getKYCData,
	verifyPan,
	gstFetch,
	getKYCDataId,
} from '../../../utils/request';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
	@media (max-width: 700px) {
		padding: 50px 0px;
		max-width: 100%;
	}
`;

const LabRed = styled.h1`
	font-size: 1em;
	font-weight: 500;
	color: red;
	margin-top: -25px;
`;

const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 50%;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

const FieldWrapperPanVerify = styled.div`
	padding: 20px 0;
	/* width: 50%; */
	place-self: center;
	margin-right: 10em;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

const H2 = styled.h2`
	width: 50%;
	text-align: center;
	font-weight: 500;
`;

const businessTypeMaps = [
	[['private', 'pvt'], 4],
	[['public', 'pub'], 5],
	[['llp'], 3],
];

function formatCompanyData(data, panNum) {
	let directors = {};
	let directorsForShow = [];

	for (const [i, dir] of data['directors/signatory_details']?.entries() || []) {
		directors[`directors_${i}`] = {
			[`ddin_no${i}`]: dir['din/pan'],
		};
		directorsForShow.push({
			Name: dir.assosiate_company_details?.director_data.name,
			Din: dir.assosiate_company_details?.director_data.din,
		});
	}

	let businesType;

	for (const type of businessTypeMaps) {
		const typeAllowed = type[0].find(t =>
			data?.company_master_data?.company_name?.toLowerCase().includes(t)
		);

		if (typeAllowed) {
			businesType = type[1];
			break;
		}
	}

	const [
		date,
		month,
		year,
	] = data.company_master_data.date_of_incorporation.split(/\/|-/);

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
		unformatedData: data,
	};
}

function formatCompanyDataGST(data, panNum, gstNum) {
	if (data?.length > 1) data = data[0].data;
	let directors = {};
	let directorsForShow = [];

	directorsForShow.push({
		Name: data?.lgnm,
		Din: '',
	});

	let businesType;

	for (const type of businessTypeMaps) {
		const typeAllowed = type[0].find(t =>
			data?.tradeNam?.toLowerCase().includes(t)
		);

		if (typeAllowed) {
			businesType = type[1];
			break;
		}
	}

	const [date, month, year] = data?.rgdt.split(/\/|-/);

	return {
		BusinessName: data.tradeNam,
		BusinessType: businesType,
		Email: '',
		BusinessVintage: `${year}-${month}-${date}`, //1990-03-16
		panNumber: panNum,
		CIN: '',
		GSTVerification: gstNum,
		CompanyCategory: data.nba[0],
		Address: data.pradr?.addr,
		ClassOfCompany: data.ctb,
		RegistrationNumber: data.ctjCd,
		DirectorDetails: directors,
		directorsForShow,
		unformatedData: data,
	};
}

export default function PanVerification({
	productDetails,
	map,
	onFlowChange,
	id,
}) {
	const productType =
		productDetails.loan_request_type === 1 ? 'business' : 'salaried';
	const {
		state: { whiteLabelId, clientToken },
	} = useContext(AppContext);

	const {
		actions: { setCompanyDetails },
	} = useContext(BussinesContext);

	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: {
			setLoanDocuments,
			removeAllDocuments,
			setPanDocDetails,
			setOtherDocDetails,
			removeLoanDocument,
		},
	} = useContext(LoanFormContext);

	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();
	const { addToast } = useToasts();

	const [loading, setLoading] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const [companyListModal, setCompanyListModal] = useState(false);
	const [dlError, setDLError] = useState('');
	const [aadharError, setAadharError] = useState('');

	const [voterError, setVoterError] = useState('');

	const [selectDoc, selectDocs] = useState(false);
	const [verificationFailed, setVerificationFailed] = useState('');
	//const [gstNum, setGstNum] = useState(null);

	const [panUpload, setPanUpload] = useState(true);
	const [file, setFile] = useState([]);
	const fileRef = useRef([]);
	const [panFile, setPanFile] = useState([]);
	const [docs, setDocs] = useState([]);
	//const [panResponse, setPanResponse] = useState(null);
	const [isBusiness, setBusiness] = useState(true);

	const product_id = sessionStorage.getItem('productId');

	const [openConfirm, setPanConfirm] = useState(false);
	const [uploadOtherDocs, setUploadOtherDocs] = useState(false);
	const [otherDoc, setOtherDoc] = useState([]);
	const [aadhar, setAadhar] = useState([]);
	const [voter, setVoter] = useState([]);
	const [panError, setPanError] = useState('');

	const [backUpload, setBackUpload] = useState(false);
	const [backUploading, setBackUploading] = useState(false);
	const [disableButton, setDisableSubmit] = useState(false);
	const [panFileId, setPanFileId] = useState(null);

	// const userid = '10626';

	useEffect(() => {
		verificationFailed && setVerificationFailed('');
		// eslint-disable-next-line
	}, [formState?.values?.gstin, formState?.values?.udhyogAadhar]);

	const onCompanySelect = cinNumber => {
		setCompanyListModal(false);
		setLoading(true);
		cinNumberFetch(cinNumber);
	};

	const [panNum, setPan] = useState('');

	const companyNameSearch = async companyName => {
		setLoading(true);
		setCompanyListModal(false);
		const companyNameSearchReq = await newRequest(
			SEARCH_COMPANY_NAME,
			{
				method: 'POST',
				data: {
					search: companyName.trim(),
				},
			},
			{}
		);

		const companyNameSearchRes = companyNameSearchReq.data;

		if (companyNameSearchRes.status === NC_STATUS_CODE.OK) {
			setCompanyListModal(true);
			setLoading(false);
			setCompanyList(companyNameSearchRes.data);
		}
	};

	const cinNumberFetch = async cinNumber => {
		const cinNumberResponse = await newRequest(
			ROC_DATA_FETCH,
			{
				method: 'POST',
				data: {
					cin_number: cinNumber,
				},
			},
			{ authorization: clientToken }
		);

		const companyData = cinNumberResponse.data;
		const reqBody = {
			email: companyData.data.company_master_data.email_id,
			white_label_id: whiteLabelId,
			source: APP_CLIENT,
			name: companyData.data.company_master_data.company_name,
			mobileNo: '9999999999',
			addrr1: '',
			addrr2: '',
		};
		if (sessionStorage.getItem('userDetails')) {
			try {
				reqBody.user_id =
					JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
			} catch (err) {
				return err;
			}
		}

		if (companyData.status === NC_STATUS_CODE.OK) {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: reqBody,
			});

			const userDetailsRes = userDetailsReq.data;

			sessionStorage.setItem('branchId', userDetailsRes.branchId);

			if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
				const encryptWhiteLabelReq = await newRequest(
					WHITELABEL_ENCRYPTION_API,
					{
						method: 'GET',
					},
					{ Authorization: `Bearer ${userDetailsRes.token}` }
				);

				const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

				sessionStorage.setItem(
					'encryptWhiteLabel',
					encryptWhiteLabelRes.encrypted_whitelabel[0]
				);

				if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
					setCompanyDetails({
						token: userDetailsRes.token,
						userId: userDetailsRes.userId,
						branchId: userDetailsRes.branchId,
						encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
						...formatCompanyData(companyData.data, panNum),
					});
				onProceed();
				return;
			}
		}
	};

	const gstNumberFetch = async (data, gstNum) => {
		const companyData = data;
		if (data?.error_code) {
			return;
		}
		setCompanyDetails({
			...formatCompanyDataGST(companyData, panNum, gstNum),
		});

		const url = window.location.hostname;

		let userToken = sessionStorage.getItem(url);

		let form = JSON.parse(userToken);

		form = {
			...form,
			formReducer: {
				...form.formReducer,
				user: {
					...form.formReducer.user,
					applicantData: {
						...form.formReducer.user.applicantData,
						...formatCompanyDataGST(companyData, panNum, gstNum),
					},
				},
			},
		};

		sessionStorage.setItem(url, JSON.stringify(form));
		sessionStorage.setItem(
			'BusinessName',
			form.formReducer.user.applicantData.BusinessName
		);
		sessionStorage.setItem(
			'busniess',
			JSON.stringify(form.formReducer.user.applicantData)
		);

		// dead code
		// let busniess = form.formReducer.user.applicantData;

		// if (busniess && busniess.Address) {
		// 	const getAddressDetails = async () => {
		// 		const companyNameSearchReq = await newRequest(
		// 			PINCODE_ADRRESS_FETCH,
		// 			{
		// 				method: 'GET',
		// 				params: {
		// 					pinCode: busniess.Address?.pncd || '',
		// 				},
		// 			},
		// 			{}
		// 		);

		// 		// const response = await newRequest(PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }), {});
		// 		const data = companyNameSearchReq.data;

		// 		busniess = {
		// 			...busniess,
		// 			Address: {
		// 				...busniess.Address,
		// 				st: data?.state?.[0],
		// 				city: data?.district?.[0],
		// 			},
		// 		};
		// 	};
		// }

		onProceed();
		return;
	};

	const onProceed = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	const handleFileUpload = files => {
		const newFiles = [];
		fileRef.current.map(f => newFiles.push({ ...f }));
		files.map(f => newFiles.push({ ...f }));
		// console.log('pan-verification-handleFileUpload-', { newFiles });
		setFile(newFiles);
		fileRef.current = newFiles;
		setPanFile(newFiles);
		setDisableSubmit(false);
		resetAllErrors();
	};

	const resetAllErrors = () => {
		setDLError('');
		setAadharError('');
		setVoterError('');
	};

	useEffect(() => {
		sessionStorage.removeItem('product');
		removeAllDocuments();
		// eslint-disable-next-line
	}, []);

	const removeHandler = (e, doc, name) => {
		// console.log('state', state.documents);
		// console.log('remveddd', e, typeof e);
		setBackUploading(false);
		setPanError('');
		resetAllErrors();
		if (name) {
			if (name === 'DL') {
				var index = doc.findIndex(x => x.id === e);
				doc.splice(index, 1);
				setOtherDoc(doc);
			}
			if (name === 'aadhar') {
				var index1 = doc.findIndex(x => x.id === e);
				doc.splice(index1, 1);
				setAadhar(doc);
			}
			if (name === 'voter') {
				var index2 = doc.findIndex(x => x.id === e);
				doc.splice(index2, 1);
				setVoter(doc);
			}
		}

		panUpload && setDocs([]);
		var index3 = file.findIndex(x => x.id === e);
		file.splice(index3, 1);
		setFile(file);
		fileRef.current = file;
		setPanFile([]);
	};

	const handlePanUpload = files => {
		setLoading(true);
		const formData = new FormData();
		formData.append('product_id', product_id);
		formData.append('req_type', 'pan');
		formData.append('process_type', 'extraction');
		formData.append('document', files);

		getKYCData(formData, clientToken)
			.then(res => {
				if (res.data.status === 'nok') {
					// setPanConfirm(true);
					// setBusiness(false);
					setPanError(res.data.message);
					// addToast({
					// 	message: res.data.message,
					// 	type: 'error',
					// });
				} else {
					//****** setting file in docs for this loan -- loanContext
					setPanDocDetails(res.data.doc_details);
					const file1 = {
						document_key: res.data.s3.fd,
						id: Math.random()
							.toString(36)
							.replace(/[^a-z]+/g, '')
							.substr(0, 6),
						mainType: 'KYC',
						size: res.data.s3.size,
						type: 'pan',
						req_type: 'pan', // requires for mapping with JSON
						requestId: res.data.request_id,
						upload_doc_name: res.data.s3.filename,
						src: 'start',
					};
					setPanFileId(file1.id);
					setLoanDocuments([file1]);
					// this ends here

					setPan(res.data.data['Pan_number']);
					sessionStorage.setItem('pan', res.data.data['Pan_number']);
					formState.values.panNumber = res.data.data['Pan_number'];
					formState.values.responseId = res?.data?.data?.id;
					formState.values.companyName = res.data.data['Name'];
					formState.values.dob = res.data.data['DOB'];
					sessionStorage.getItem('DOB', res.data.data['DOB']);
					sessionStorage.setItem('formstatepan', JSON.stringify(formState));
					if (productType === 'business') {
						if (
							!(
								res.data.data['Name']
									.toLowerCase()
									.includes('private limited') ||
								res.data.data['Name']
									.toLowerCase()
									.includes('public limited') ||
								res.data.data['Name'].toLowerCase().includes('limited') ||
								res.data.data['Name'].toLowerCase().includes('pvt ltd') ||
								res.data.data['Name'].toLowerCase().includes('private')
							)
						) {
							setBusiness(false);
							setPanUpload(false);
						} else {
							onSubmit(formState);
						}
					}
					if (productType === 'salaried') {
						const name =
							res.data?.data?.name?.split(' ') ||
							res.data?.data?.Name?.split(' ');
						if (name) {
							formState.values.firstName = name[0];
							formState.values.lastName = name[1];
						}
						setPanConfirm(true);
					}
					//setPanResponse(res.data);
				}
				setLoading(false);
				setFile([]);
				fileRef.current = [];
			})
			.catch(err => {
				console.log(err);
				setPanConfirm(true);
				setBusiness(false);

				addToast({
					message: err.message,
					type: 'error',
				});
				setLoading(false);
			});
	};

	const onSubmit = async ({
		panNumber,
		companyName,
		udhyogAadhar,
		gstin,
		gstNumber,
	}) => {
		setLoading(true);
		setVerificationFailed('');
		//setGstNum(gstin);

		if (productType === 'business') {
			if (isBusiness) {
				if (!formState?.values?.companyName && !formState?.values?.panNumber) {
					return;
				}

				try {
					if (
						formState?.values?.panNumber &&
						formState?.values?.companyName &&
						formState.values.responseId
					) {
						await verifyPan(
							formState.values.responseId,
							formState?.values?.panNumber,
							formState?.values?.companyName,
							clientToken
						);
					}

					if (formState?.values?.companyName) {
						await companyNameSearch(formState?.values?.companyName);
					}
				} catch (error) {
					console.error(error);
					addToast({
						message: error.message || 'Something Went Wrong. Try Again!',
						type: 'error',
					});
				}

				// setLoading(false);
			} else {
				sessionStorage.setItem('product', 'demo');
				if (!panNumber) {
					setLoading(false);
					return;
				}

				if (!udhyogAadhar && (!gstin || gstin === '')) {
					setLoading(false);
					return;
				}

				try {
					if (!panNumber) {
						setLoading(false);
						return;
					}
					if (panNumber && !gstin) {
					}
					if (udhyogAadhar) {
						if (udhyogAadhar.length !== 12) {
							setVerificationFailed('Character Length Mismatch');
							setLoading(false);
							return;
						} else {
							onProceed();
							return;
						}
						// api not ready. after api ready will enable this code and add url
						// const y = await verifyPan(
						// 	formState.values.responseId,
						// 	formState.values?.udhyogAadhar,
						// 	formState?.values?.companyName,
						// 	clientToken
						// );
						// if (y.data.status === 'nok') {
						// 	setVerificationFailed(
						// 		typeof y.data.message === 'string'
						// 			? y.data.message
						// 			: y.data.message.message
						// 	);
						// 	setLoading(false);
						// 	return;
						// }
						// if (y.status === 500) {
						// 	setLoading(false);
						// 	addToast({
						// 		type: 'error',
						// 		message: y.message,
						// 	});
						// 	return;
						// }
					}

					let stateCode = null,
						panFromGstin = null;
					if (gstin) {
						if (gstin.length !== 15) {
							setVerificationFailed('Character Length Mismatch');
							setLoading(false);
							return;
						}
						stateCode = gstin.slice(0, 2);
						panFromGstin = gstin.slice(2, 12);
						const restGstin = gstin.slice(12, 15);

						const lastthreeDigitsValidation = /[1-9A-Z]{1}Z[0-9A-Z]{1}/.test(
							restGstin
						);
						const stateCodeValidation = /[0-9]/.test(stateCode);
						if (!lastthreeDigitsValidation || !stateCodeValidation) {
							setVerificationFailed('Please specify a valid GSTIN');
							setLoading(false);
							return;
						}
						if (panFromGstin !== panNumber || !lastthreeDigitsValidation) {
							setVerificationFailed('Invalid GSTIN for the given PAN');
							setLoading(false);
							return;
						}
					}

					if (panNumber) {
						await gstFetch(panNumber, stateCode, gstin, clientToken).then(
							res => {
								if (res?.data?.status === 'nok') {
									setVerificationFailed('Invalid GSTIN pattern');
									setLoading(false);
									return;
								} else if (res?.data?.data?.error_code) {
									setVerificationFailed(res?.data?.data.message);
									setLoading(false);
									return;
								} else
									gstNumberFetch(
										res?.data?.data[0]?.data || res?.data?.data,
										gstin
									);
							}
						);
					}
				} catch (error) {
					console.error(error);
					addToast({
						message: error.message || 'Something Went Wrong. Try Again!',
						type: 'error',
					});
				}
			}

			// setLoading(false);
		} else {
			if (
				(aadhar.length > 0 && otherDoc.length > 0) ||
				(aadhar.length > 0 && voter.length > 0) ||
				(voter.length > 0 && otherDoc.length > 0)
			) {
				setLoading(false);
				return addToast({
					message: `please upload only one type of document`,
					type: 'error',
				});
			}
			if (aadhar.length > 0 && aadhar[0]?.file) {
				handleUpload(aadhar[0]?.file);
			}
			if (voter.length > 0 && voter[0].file) {
				handleUpload(voter[0]?.file);
			}
			if (otherDoc.length > 0 && otherDoc[0]?.file) {
				handleUpload(otherDoc[0]?.file);
			}

			// setLoading(false);
		}
	};

	const getFileType = () => {
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

	useEffect(() => {
		if (aadhar.length > 0 || voter.length > 0 || otherDoc.length > 0)
			setBackUpload(true);
	}, [otherDoc, aadhar, voter, backUploading]);

	const handleUpload = files => {
		// console.log('here');
		setLoading(true);
		const fileType = getFileType();
		resetAllErrors();
		if (file.length > 1) {
			// console.log('extract 2 image front and back');
			const formData1 = new FormData();
			formData1.append('product_id', product_id);
			formData1.append('req_type', fileType);
			formData1.append('process_type', 'extraction');
			formData1.append('document', file[1].file);

			getKYCData(formData1, clientToken).then(re => {
				if (re.data.status === 'nok') {
					setDLAadharVoterError(re.data.message);
				} else {
					//****** setting file in docs for this loan -- loanContext
					setOtherDocDetails(re.data.doc_details);
					const myfile = {
						document_key: re.data.s3.fd,
						id: Math.random()
							.toString(36)
							.replace(/[^a-z]+/g, '')
							.substr(0, 6),
						mainType: 'KYC',
						size: re.data.s3.size,
						type: 'other',
						req_type: fileType, // requires for mapping with JSON
						requestId: re.data.request_id,
						upload_doc_name: re.data.s3.filename,
						src: 'start',
					};

					setLoanDocuments([myfile]);
					// this ends here

					const formData2 = new FormData();
					formData1.append('product_id', product_id);
					formData2.append('req_type', fileType);
					formData2.append('process_type', 'extraction');
					formData2.append('document', file[0].file);
					getKYCDataId(re?.data?.data?.id, formData2, clientToken).then(res => {
						if (res.data.status === 'nok') {
							setDLAadharVoterError(res.data.message);
						} else {
							//****** setting file in docs for this loan -- loanContext

							// re.data.doc_type_id = '31';
							const myfile2 = {
								document_key: res.data.s3.fd,
								id: Math.random()
									.toString(36)
									.replace(/[^a-z]+/g, '')
									.substr(0, 6),
								mainType: 'KYC',
								size: res.data.s3.size,
								type: 'other',
								req_type: fileType,
								requestId: res.data.request_id,
								upload_doc_name: res.data.s3.filename,
								src: 'start',
							};

							setLoanDocuments([myfile2]);
							// this ends here

							const aadharNum = res?.data?.data?.Aadhar_number?.replaceAll(
								/\s/g,
								''
							).split('');
							formState.values.aadhaarUnMasked = aadharNum?.join('') || '';
							const t = aadharNum
								? '00000000' + aadharNum?.splice(8, 4).join('')
								: '';
							const name =
								res.data?.data?.name?.split(' ') ||
								res.data?.data?.Name?.split(' ');
							formState.values.aadhaar = t;
							sessionStorage.setItem('aadhar', t);
							formState.values.dob = res?.data?.data?.DOB;
							let firstName = [...name];
							firstName.pop();
							formState.values.firstName = firstName.join(' ');
							formState.values.lastName = name[name.length - 1];
							formState.values.dob =
								res?.data?.data?.DOB || res?.data?.data?.dob;
							formState.values.dl_no = res.data?.data?.dl_no;
							formState.values.address1 =
								res.data?.data?.address || res?.data?.data?.Address;
							let address = formState.values.address1;

							var pinCode = res?.data?.data?.pincode;

							if (address) {
								let locationArr = address && address?.split(' ');
								let y = locationArr?.map(e => isNaN(!Number(e)) && e);
								let pin;
								y.map(e => {
									if (e?.length === 6) pin = e;
									return null;
								});

								formState.values.pin = pinCode || pin;
							}

							sessionStorage.setItem('formstate', JSON.stringify(formState));
							emptyDoc();
							onProceed();
						}
						setLoading(false);
					});
				}
			});
		} else {
			// console.log('extract 1 image only front');
			const formData = new FormData();
			formData.append('product_id', product_id);
			formData.append('req_type', fileType);
			formData.append('process_type', 'extraction');
			formData.append('document', files);

			getKYCData(formData, clientToken).then(res => {
				if (res.data.status === 'nok') {
					setDLAadharVoterError(res.data.message);
				} else {
					// data ---> extractionData
					// ref_id: pass the id from the first doc response
					// combine data
					//****** setting file in docs for this loan -- loanContext
					setOtherDocDetails(res.data.doc_details);
					// res.data.doc_type_id = '31';
					const file2 = {
						document_key: res.data.s3.fd,
						id: Math.random()
							.toString(36)
							.replace(/[^a-z]+/g, '')
							.substr(0, 6),
						mainType: 'KYC',
						size: res.data.s3.size,
						type: 'other',
						req_type: fileType,
						requestId: res.data.request_id,
						upload_doc_name: res.data.s3.filename,
						src: 'start',
					};

					setLoanDocuments([file2]);
					// this ends here

					const aadharNum = res?.data?.data?.Aadhar_number?.replaceAll(
						/\s/g,
						''
					).split('');
					formState.values.aadhaarUnMasked = aadharNum?.join('') || '';
					const t = aadharNum
						? '00000000' + aadharNum?.splice(8, 4).join('')
						: '';
					const name =
						res.data?.data?.name?.split(' ') ||
						res.data?.data?.Name?.split(' ');
					formState.values.aadhaar = t;
					sessionStorage.setItem('aadhar', t);
					formState.values.dob = res?.data?.data?.DOB;
					let fName = [...name];
					fName.pop();
					formState.values.firstName = fName.join(' ');
					formState.values.lastName = name[name.length - 1];

					formState.values.dob = res?.data?.data?.DOB || res?.data?.data?.dob;
					formState.values.dl_no = res.data?.data?.dl_no;
					formState.values.address1 =
						res.data?.data?.address || res?.data?.data?.Address;
					let address = formState.values.address1;

					var pinCode = res?.data?.data?.pincode;

					if (address) {
						let locationArr = address && address?.split(' ');
						let y = locationArr?.map(e => isNaN(!Number(e)) && e);
						let pin;
						y.map(e => {
							if (e?.length === 6) pin = e;
							return null;
						});

						formState.values.pin = pinCode || pin;
					}

					sessionStorage.setItem('formstate', JSON.stringify(formState));
					emptyDoc();
					onProceed();
				}
				setLoading(false);
			});
		}
	};

	const emptyDoc = () => {
		setOtherDoc([]);
		setAadhar([]);
		setVoter([]);
	};

	const setDLAadharVoterError = message => {
		if (otherDoc.length > 0) {
			setDLError(message);
		}
		if (aadhar.length > 0) {
			setAadharError(message);
		}
		if (voter.length > 0) {
			setVoterError(message);
		}
		setLoading(false);
	};

	return (
		productDetails && (
			<>
				<Colom1>
					{panUpload ? (
						<section className='flex flex-col gap-y-6'>
							<p className='py-4 text-xl'>
								Upload your PAN Card{' '}
								{/* <Span>supported formats - jpeg, png, jpg</Span> */}
							</p>
							<FileUpload
								accept=''
								upload={true}
								// upload={{
								// 	url: DOCS_UPLOAD_URL_LOAN({
								// 		userid,
								// 	}),
								// 	header: {
								// 		Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
								// 	},
								// }}
								sectionType='pan'
								pan={true}
								disabled={panFile.length > 0 ? true : false}
								onDrop={handleFileUpload}
								onRemoveFile={e => removeHandler(e)}
								docs={docs}
								setDocs={setDocs}
								errorMessage={panError}
							/>
							{panError && (
								<p style={{ color: 'red', marginTop: '-35px' }}>
									{panError}
									{/* <Span>supported formats - jpeg, png, jpg</Span> */}
								</p>
							)}
							<section>
								<Button
									onClick={() => {
										if (docs.length > 0) {
											handlePanUpload(docs[0].file);
											setDocs([]);
										}
									}}
									isLoader={loading}
									name={loading ? 'Please wait...' : 'Proceed'}
									disabled={!docs.length > 0}
									fill
								/>
							</section>
						</section>
					) : (
						<form onSubmit={handleSubmit(onSubmit)}>
							{uploadOtherDocs ? (
								<>
									<p className='py-4 text-xl text-black'>
										Upload{' '}
										{(backUploading && 'back picture of') || 'front picture of'}{' '}
										your DL
										{/* <Span>supported formats - jpeg, png, jpg</Span> */}
									</p>

									<FileUpload
										section={'pan-verification'}
										accept=''
										upload={true}
										// upload={{
										// 	url: DOCS_UPLOAD_URL_LOAN({
										// 		userid,
										// 	}),
										// 	header: {
										// 		Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
										// 	},
										// }}
										pan={true}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e, otherDoc, 'DL')}
										docs={otherDoc}
										setDocs={setOtherDoc}
										aadharVoterDl={true}
										errorMessage={dlError}
									/>
									{dlError.length > 0 && (
										<p
											style={{
												color: 'red',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											{dlError}
										</p>
									)}
									<h1
										className='text-xl text-black'
										style={{ marginLeft: '50%' }}>
										OR
									</h1>
									<p className='py-4 text-xl text-black'>
										Upload{' '}
										{(backUploading && 'back picture of') || 'front picture of'}{' '}
										your Aadhaar
										{/* <Span>supported formats - jpeg, png, jpg</Span> */}
									</p>

									<FileUpload
										accept=''
										upload={true}
										// upload={{
										// 	url: DOCS_UPLOAD_URL_LOAN({
										// 		userid,
										// 	}),
										// 	header: {
										// 		Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
										// 	},
										// }}
										pan={true}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e, aadhar, 'aadhar')}
										docs={aadhar}
										setDocs={setAadhar}
										aadharVoterDl={true}
										errorMessage={aadharError}
									/>
									{aadharError.length > 0 && (
										<p
											style={{
												color: 'red',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											{aadharError}
										</p>
									)}
									<h1
										className='text-xl text-black'
										style={{ marginLeft: '50%' }}>
										OR
									</h1>
									<p className='py-4 text-xl text-black'>
										Upload{' '}
										{(backUploading && 'back picture of') || 'front picture of'}{' '}
										your Voter ID{' '}
										{/* <Span>supported formats - jpeg, png, jpg</Span> */}
									</p>

									<FileUpload
										accept=''
										upload={true}
										// upload={{
										// 	url: DOCS_UPLOAD_URL_LOAN({
										// 		userid,
										// 	}),
										// 	header: {
										// 		Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
										// 	},
										// }}
										pan={true}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e, voter, 'voter')}
										docs={voter}
										setDocs={setVoter}
										aadharVoterDl={true}
										errorMessage={voterError}
									/>
									{voterError.length > 0 && (
										<p
											style={{
												color: 'red',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											{voterError}
										</p>
									)}
								</>
							) : (
								<>
									<FieldWrapper>
										{register({
											name: 'panNumber',
											placeholder: 'Pan Number',
											value: formState?.values?.panNumber,
										})}
									</FieldWrapper>

									<FieldWrapper>
										{register({
											name: 'gstin',
											placeholder: 'GST Identification Number',
											mask: { AlphaNumericOnly: true, CharacterLimit: 15 },
											value: formState?.values?.gstin,
											style: {
												borderColor:
													formState?.values?.gstin &&
													verificationFailed &&
													'red',
											},
										})}
									</FieldWrapper>
									{formState?.values?.gstin && verificationFailed && (
										<FieldWrapper>
											<LabRed>{verificationFailed}</LabRed>
										</FieldWrapper>
									)}
									<br />
									<H2>OR</H2>

									<FieldWrapper>
										{register({
											name: 'udhyogAadhar',
											placeholder: 'Udhyog Aadhar Number',
											value: formState?.values?.udhyogAadhar,
											style: {
												borderColor:
													formState?.values?.udhyogAadhar &&
													verificationFailed &&
													'red',
											},
											mask: { CharacterLimit: 12 },
										})}
									</FieldWrapper>
									{formState?.values?.udhyogAadhar && verificationFailed && (
										<FieldWrapper>
											<LabRed>{verificationFailed}</LabRed>
										</FieldWrapper>
									)}
								</>
							)}

							<section className='flex flex-wrap items-center gap-x-4 gap-y-4'>
								{/*  <Button
									onClick={() => {
										setPanUpload(true);
										setVerificationFailed(null);
										setBusiness(true);
										setPanFile([]);
									}}
									name='Upload PAN again'
									fill
								/> */}
								<Button
									type='submit'
									isLoader={loading}
									name={loading ? 'Please wait...' : 'Proceed'}
									fill
									disabled={
										productType !== 'salaried'
											? isBusiness
												? !(
														formState.values?.companyName ||
														formState.values?.panNumber
												  ) ||
												  (formState.values?.companyName &&
														formState.values?.panNumber)
												: (!(
														formState.values?.udhyogAadhar &&
														formState.values?.panNumber
												  ) &&
														!(
															formState.values?.panNumber &&
															formState?.values?.gstin
														)) ||
												  loading ||
												  (verificationFailed && verificationFailed.length > 0)
											: !(
													aadhar.length > 0 ||
													otherDoc.length > 0 ||
													voter.length > 0
											  ) ||
											  disableButton ||
											  loading ||
											  voterError.length > 0 ||
											  aadharError.length > 0 ||
											  dlError.length > 0
									}
								/>
							</section>
						</form>
					)}
				</Colom1>
				{/* <Colom2>
					<Img src={productDetails.productDetailsImage} alt="Loan Caption" />
				</Colom2> */}
				{
					<CompanySelectModal
						companyNameSearch={companyNameSearch}
						show={companyListModal}
						companyName={formState?.values?.companyName}
						companyList={companyList}
						onClose={() => {
							if (panFileId) removeLoanDocument(panFileId);
							setCompanyListModal(false);
						}}
						onCompanySelect={onCompanySelect}
						formState={formState}
					/>
				}
				{openConfirm && (
					<Modal
						show={openConfirm}
						onClose={() => {
							if (panFileId) removeLoanDocument(panFileId);
							setPanConfirm(false);
						}}
						width='30%'>
						<section className='p-4 flex flex-col gap-y-8'>
							<span>Confirm PAN number and Proceed</span>
							{/* <section className='flex gap-x-4 items-center'> */}
							<FieldWrapperPanVerify>
								{register({
									name: 'panNumber',
									placeholder: 'Pan Number',
									value: formState?.values?.panNumber,
								})}
							</FieldWrapperPanVerify>
							{/* </section> */}
							<Button
								name='Proceed'
								fill
								onClick={() => {
									sessionStorage.setItem('pan', formState?.values?.panNumber);
									setPanConfirm(false);
									setPanUpload(false);
									if (productType === 'salaried') {
										setUploadOtherDocs(true);
									}
								}}
								disabled={!formState?.values?.panNumber}
								style={{ alignSelf: 'center' }}
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
							width='30%'>
							<span className='px-10 font-bold justify-center'>
								Upload back part of the document?
							</span>
							<section className='p-4 py-16 flex justify-center flex-wrap gap-y-8 gap-x-8'>
								<Button
									name='Yes'
									fill
									onClick={() => {
										setBackUploading(true);
										setBackUpload(false);
										setDisableSubmit(true);
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
								name='Proceed'
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
	id: string,
};
