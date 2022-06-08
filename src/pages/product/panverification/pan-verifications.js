/* Pan verification page - This section has both pan upload and
address-proof upload section defined here*/

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
import WarnIcon from 'assets/icons/amber_warning_icon.png';
import ErrorIcon from 'assets/icons/Red_error_icon.png';
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
import _ from 'lodash';

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

const Cardstyle = styled.div`
	box-shadow: 0 4px 9px 0 #bdd2ef;
	width: 150px;
	height: 40px;
	border-radius: 7px;
	text-align: center;
	padding-top: 6px;
`;

const NotificationImg = styled.img`
	margin-right: 8px;
	width: 33px;
	display: inline-block;
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

const getDocumentTypeList = value => {
	if (value === 'aadhar') {
		return [
			{ typeId: 1, value: 1, doc_type_id: 1, id: 1, name: 'Aadhar Front Part' },
			{ typeId: 2, value: 2, doc_type_id: 2, id: 2, name: 'Aadhar Back Part' },
			{
				typeId: 3,
				value: 3,
				doc_type_id: 3,
				id: 3,
				name: 'Aadhar  Front Back Part',
			},
		];
	}
	if (value === 'voter') {
		return [
			{ typeId: 4, value: 4, doc_type_id: 4, id: 4, name: 'Voter  Front Part' },
			{ typeId: 5, value: 5, doc_type_id: 5, id: 5, name: 'Voter Back Part' },
			{
				typeId: 6,
				value: 6,
				doc_type_id: 6,
				id: 6,
				name: 'Voter  Front Back Part',
			},
		];
	}
	if (value === 'DL') {
		return [
			{ typeId: 7, value: 7, doc_type_id: 7, id: 7, name: 'DL Front Part' },
			{ typeId: 8, value: 8, doc_type_id: 8, id: 8, name: 'DL Back Part' },
			{
				typeId: 9,
				value: 9,
				doc_type_id: 9,
				id: 9,
				name: 'DL Front Back Part',
			},
		];
	}
	if (value === 'passport') {
		return [
			{
				typeId: 10,
				value: 10,
				doc_type_id: 10,
				id: 10,
				name: 'Passport Front Part',
			},
			{
				typeId: 11,
				value: 11,
				doc_type_id: 11,
				id: 11,
				name: 'Passport  Back Part',
			},
			{
				typeId: 12,
				value: 12,
				doc_type_id: 12,
				id: 12,
				name: 'Passport Front Back Part',
			},
		];
	}
};

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
	const [isError, setIsError] = useState(false);
	const [isWarning, setIsWarning] = useState(false);
	const [selectedAddressProof, setSelectedAddressProof] = useState(false);
	const [isAddharSkipChecked, setIsAddharSkipChecked] = useState(false);
	const [addressProofDocs, setAddressProofDocs] = useState([]);
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
		setIsError(false);
	};

	const resetAllErrors = () => {
		setPanError('');
		setDLError('');
		setAadharError('');
		setVoterError('');
		setIsError(false);
		setIsWarning(false);
	};

	useEffect(() => {
		sessionStorage.removeItem('product');

		// removeAllDocuments();
		// eslint-disable-next-line
	}, []);

	const removeHandler = docId => {
		setBackUploading(false);
		resetAllErrors();

		if (panUpload) {
			panUpload && setDocs([]);
			var index3 = file.findIndex(x => x.id === docId);
			file.splice(index3, 1);
			setFile(file);
			fileRef.current = file;
			setPanFile([]);
			return;
		}

		const newAddressProofDocs = _.cloneDeep(addressProofDocs);
		const selectedDocIndex = newAddressProofDocs.findIndex(x => x.id === docId);
		newAddressProofDocs.splice(selectedDocIndex, 1);
		setAddressProofDocs(newAddressProofDocs);
		// setAddressProofDocs(doc)
		// if (name) {
		// 	if (name === 'DL') {
		// 		var index = doc.findIndex(x => x.id === e);
		// 		doc.splice(index, 1);
		// 		setOtherDoc(doc);
		// 	}
		// 	if (name === 'aadhar') {
		// 		var index1 = doc.findIndex(x => x.id === e);
		// 		doc.splice(index1, 1);
		// 		setAadhar(doc);
		// 	}
		// 	if (name === 'voter') {
		// 		var index2 = doc.findIndex(x => x.id === e);
		// 		doc.splice(index2, 1);
		// 		setVoter(doc);
		// 	}
		// }
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

	const handlePanConfirm = async () => {
		setLoading(true);
		// call verifykyc api

		// put all require condition for next screen here
		sessionStorage.setItem('pan', formState?.values?.panNumber);

		if (productType === 'business' && isBusiness) {
			// business + business pan
			await onSubmit(formState);
		} else if (productType === 'business') {
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
			} catch (error) {
				console.error(error);
				addToast({
					message: error.message || 'Something Went Wrong. Try Again!',
					type: 'error',
				});
			}
			// business + personal pan
			setPanUpload(false);
			setUploadOtherDocs(false);
		} else if (productType === 'salaried') {
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
			} catch (error) {
				console.error(error);
				addToast({
					message: error.message || 'Something Went Wrong. Try Again!',
					type: 'error',
				});
			}
			// salaried
			setPanUpload(false);
			setUploadOtherDocs(true);
		}
		setLoading(false);
		setPanConfirm(false);
	};

	// Pancard upload handle function
	const handlePanUpload = async files => {
		try {
			setLoading(true);
			const formData = new FormData();
			formData.append('product_id', product_id);
			formData.append('req_type', 'pan');
			formData.append('process_type', 'extraction');
			formData.append('document', files);

			const panExtractionRes = await getKYCData(formData, clientToken);
			const panExtractionStatus = panExtractionRes?.data?.status || '';
			const panExtractionMsg = panExtractionRes?.data?.message || '';
			const panForensicRes = panExtractionRes?.data?.forensicData || {};
			const panForensicFlag = panForensicRes?.flag?.toLowerCase() || '';
			const panForensicFlagMsg = panForensicRes?.flag_message || '';
			// console.log('forensicData-pan-verification', {
			// 	panExtractionRes,
			// 	panExtractionStatus,
			// 	panExtractionMsg,
			// 	panForensicRes,
			// 	panForensicFlag,
			// 	panForensicFlagMsg,
			// });
			if (panExtractionStatus === 'nok') {
				// setPanConfirm(true);
				// setBusiness(false);
				setIsError(true);
				setPanError(panExtractionMsg);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'error') {
				setIsError(true);
				setPanError(panForensicFlagMsg);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'warning') {
				setIsWarning(true);
				setPanError(panForensicFlagMsg);
				// CONTINUE EXECUTION
			}
			const file1 = {
				...(panExtractionRes?.data?.extractionData || {}),
				document_key: panExtractionRes?.data.s3.fd,
				id: Math.random()
					.toString(36)
					.replace(/[^a-z]+/g, '')
					.substr(0, 6),
				mainType: 'KYC',
				size: panExtractionRes?.data.s3.size,
				type: 'pan',
				req_type: 'pan', // requires for mapping with JSON
				requestId: panExtractionRes?.data.request_id,
				upload_doc_name: panExtractionRes?.data.s3.filename,
				isDocRemoveAllowed: false,
			};
			setPanFileId(file1.id);
			setLoanDocuments([file1]);
			// this ends here

			setPan(panExtractionRes?.data.extractionData['Pan_number']);
			sessionStorage.setItem(
				'pan',
				panExtractionRes?.data.extractionData['Pan_number']
			);
			formState.values.panNumber =
				panExtractionRes?.data.extractionData['Pan_number'];
			formState.values.responseId = panExtractionRes?.data?.extractionData?.id;
			formState.values.companyName =
				panExtractionRes?.data.extractionData['Name'];
			formState.values.dob = panExtractionRes?.data.extractionData['DOB'];
			sessionStorage.getItem(
				'DOB',
				panExtractionRes?.data.extractionData['DOB']
			);
			sessionStorage.setItem('formstatepan', JSON.stringify(formState));
			if (productType === 'business') {
				if (
					!(
						panExtractionRes?.data.extractionData['Name']
							.toLowerCase()
							.includes('private limited') ||
						panExtractionRes?.data.extractionData['Name']
							.toLowerCase()
							.includes('public limited') ||
						panExtractionRes?.data.extractionData['Name']
							.toLowerCase()
							.includes('limited') ||
						panExtractionRes?.data.extractionData['Name']
							.toLowerCase()
							.includes('pvt ltd') ||
						panExtractionRes?.data.extractionData['Name']
							.toLowerCase()
							.includes('private')
					)
				) {
					setBusiness(false);
					// if (panForensicFlag !== 'warning') setPanUpload(false);
				} else {
					// if (panForensicFlag !== 'warning') onSubmit(formState);
				}
			}
			if (productType === 'salaried') {
				const name =
					panExtractionRes?.data?.extractionData?.name?.split(' ') ||
					panExtractionRes?.data?.extractionData?.Name?.split(' ');
				if (name) {
					formState.values.firstName = name[0];
					formState.values.lastName = name[1];
				}
				if (panForensicFlag !== 'warning') setPanConfirm(true);
			}
			setLoading(false);
			setFile([]);
			setPanConfirm(true);
			fileRef.current = [];
		} catch (error) {
			console.error('error-pan-verification-handlePanUpload-', error);
			setPanConfirm(true);
			setBusiness(false);
			addToast({
				message: error.message,
				type: 'error',
			});
			setLoading(false);
		}
	};

	const prepopulateAadhaarAndAddressState = extractionData => {
		console.log('prepopulateAadhaarAndAddressState-', extractionData);
		const aadharNum = extractionData?.Aadhar_number?.replaceAll(
			/\s/g,
			''
		).split('');
		formState.values.aadhaarUnMasked = aadharNum?.join('') || '';
		const t = aadharNum ? '00000000' + aadharNum?.splice(8, 4).join('') : '';
		const name =
			extractionData?.name?.split(' ') || extractionData?.Name?.split(' ');
		formState.values.aadhaar = t;
		sessionStorage.setItem('aadhar', t);
		formState.values.dob = extractionData?.DOB;
		let fName = [...name];
		fName.pop();
		formState.values.firstName = fName.join(' ');
		formState.values.lastName = name[name.length - 1];

		formState.values.dob = extractionData?.DOB || extractionData?.dob;
		formState.values.dl_no = extractionData?.dl_no;
		formState.values.address1 =
			extractionData?.address || extractionData?.Address;
		let address = formState.values.address1;

		var pinCode = extractionData?.pincode;

		if (address) {
			let locationArr = address && address?.split(' ');
			let y = locationArr?.map(e => Number(e) !== NaN && e);
			let pin;
			y.map(e => {
				if (e?.length === 6) pin = e;
			});

			formState.values.pin = pinCode || pin;
		}

		sessionStorage.setItem('formstate', JSON.stringify(formState));
	};

	// Address proof upload handle function
	// DL Aadhaar VoterID
	const handleUpload = async files => {
		try {
			setLoading(true);
			const fileType = getFileType();
			resetAllErrors();

			if (file.length > 2) {
				addToast({
					message: 'Max 2 doucment is allowed',
					type: 'error',
				});
				setLoading(false);
				return;
			}

			if (file.length > 1) {
				// Front and Back Image
				const frontFormData = new FormData();
				frontFormData.append('product_id', product_id);
				frontFormData.append('req_type', fileType);
				frontFormData.append('process_type', 'extraction');
				frontFormData.append('document', file[1].file);

				const frontExtractionRes = await getKYCData(frontFormData, clientToken);
				const frontExtractionStatus = frontExtractionRes?.data?.status || '';
				const frontExtractionMsg = frontExtractionRes?.data?.message || '';
				const frontForensicRes = frontExtractionRes?.data?.forensicData || {};
				const frontForensicFlag = frontForensicRes?.flag?.toLowerCase() || '';
				const frontForensicFlagMsg = frontForensicRes?.flag_message || '';

				if (frontExtractionStatus === 'nok') {
					setIsError(true);
					setDLAadharVoterError(frontExtractionMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'error') {
					setIsError(true);
					setDLAadharVoterError(frontForensicFlagMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'warning') {
					setIsWarning(true);
					setDLAadharVoterError(frontForensicFlagMsg);
					// CONTINUE EXECUTION
				}

				const frontFile = {
					...(frontExtractionRes?.data?.extractionData || {}),
					document_key: frontExtractionRes?.data?.s3?.fd,
					id: Math.random()
						.toString(36)
						.replace(/[^a-z]+/g, '')
						.substr(0, 6),
					mainType: 'KYC',
					size: frontExtractionRes?.data?.s3?.size,
					type: 'other',
					req_type: fileType, // requires for mapping with JSON
					requestId: frontExtractionRes?.data?.request_id,
					upload_doc_name: frontExtractionRes?.data?.s3?.filename,
					isDocRemoveAllowed: false,
				};

				setLoanDocuments([frontFile]);
				// this ends here

				const backFormData = new FormData();
				backFormData.append('product_id', product_id);
				backFormData.append('req_type', fileType);
				backFormData.append(
					'ref_id',
					frontExtractionRes?.data?.extractionData?.id
				);
				backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
				backFormData.append('process_type', 'extraction');
				backFormData.append('document', file[0].file);

				const backExtractionRes = await getKYCDataId(backFormData, clientToken);
				const backExtractionStatus = backExtractionRes?.data?.status || '';
				const backExtractionMsg = backExtractionRes?.data?.message || '';
				const backForensicRes = backExtractionRes?.data?.forensicData || {};
				const backForensicFlag = backForensicRes?.flag?.toLowerCase() || '';
				const backForensicFlagMsg = backForensicRes?.flag_message || '';

				if (backExtractionStatus === 'nok') {
					setIsError(true);
					setDLAadharVoterError(backExtractionMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'error') {
					setIsError(true);
					setDLAadharVoterError(backForensicFlagMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'warning') {
					setIsWarning(true);
					setDLAadharVoterError(backForensicFlagMsg);
					// CONTINUE EXECUTION
				}

				const backFile = {
					...(backExtractionRes?.data?.extractionData || {}),
					document_key: backExtractionRes?.data.s3.fd,
					id: Math.random()
						.toString(36)
						.replace(/[^a-z]+/g, '')
						.substr(0, 6),
					mainType: 'KYC',
					size: backExtractionRes?.data.s3.size,
					type: 'other',
					req_type: fileType,
					requestId: backExtractionRes?.data.request_id,
					upload_doc_name: backExtractionRes?.data.s3.filename,
					isDocRemoveAllowed: false,
				};

				setLoanDocuments([backFile]);
				// this ends here

				prepopulateAadhaarAndAddressState(
					backExtractionRes?.data?.extractionData || {}
				);
				// TODO: Remove this code
				// const aadharNum = backExtractionRes?.data?.extractionData?.Aadhar_number?.replaceAll(
				// 	/\s/g,
				// 	''
				// ).split('');
				// formState.values.aadhaarUnMasked = aadharNum?.join('') || '';
				// const t = aadharNum
				// 	? '00000000' + aadharNum?.splice(8, 4).join('')
				// 	: '';
				// const name =
				// 	backExtractionRes?.data?.extractionData?.name?.split(' ') ||
				// 	backExtractionRes?.data?.extractionData?.Name?.split(' ');
				// formState.values.aadhaar = t;
				// sessionStorage.setItem('aadhar', t);
				// formState.values.dob = backExtractionRes?.data?.extractionData?.DOB;
				// let firstName = [...name];
				// firstName.pop();
				// formState.values.firstName = firstName.join(' ');
				// formState.values.lastName = name[name.length - 1];
				// formState.values.dob =
				// 	backExtractionRes?.data?.extractionData?.DOB ||
				// 	backExtractionRes?.data?.extractionData?.dob;
				// formState.values.dl_no = backExtractionRes?.data?.extractionData?.dl_no;
				// formState.values.address1 =
				// 	backExtractionRes?.data?.extractionData?.address ||
				// 	backExtractionRes?.data?.extractionData?.Address;
				// let address = formState.values.address1;

				// var pinCode = backExtractionRes?.data?.extractionData?.pincode;

				// if (address) {
				// 	let locationArr = address && address?.split(' ');
				// 	let y = locationArr?.map(e => Number(e) !== NaN && e);
				// 	let pin;
				// 	y.map(e => {
				// 		if (e?.length === 6) pin = e;
				// 	});

				// 	formState.values.pin = pinCode || pin;
				// }

				// sessionStorage.setItem('formstate', JSON.stringify(formState));
				emptyDoc();
				if (backForensicRes !== 'warning') onProceed();
				setLoading(false);
			} else {
				// Front Only
				const frontOnlyFormData = new FormData();
				frontOnlyFormData.append('product_id', product_id);
				frontOnlyFormData.append('req_type', fileType);
				frontOnlyFormData.append('process_type', 'extraction');
				frontOnlyFormData.append('document', files);

				const frontOnlyExtractionRes = await getKYCData(
					frontOnlyFormData,
					clientToken
				);
				const frontOnlyExtractionStatus =
					frontOnlyExtractionRes?.data?.status || '';
				const frontOnlyExtractionMsg =
					frontOnlyExtractionRes?.data?.message || '';
				const frontOnlyForensicRes =
					frontOnlyExtractionRes?.data?.forensicData || {};
				const frontOnlyForensicFlag =
					frontOnlyForensicRes?.flag?.toLowerCase() || '';
				const frontOnlyForensicFlagMsg =
					frontOnlyForensicRes?.flag_message || '';

				if (frontOnlyExtractionStatus === 'nok') {
					setIsError(true);
					setDLAadharVoterError(frontOnlyExtractionMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontOnlyForensicFlag === 'error') {
					setIsError(true);
					setDLAadharVoterError(frontOnlyForensicFlagMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontOnlyForensicFlag === 'warning') {
					setIsWarning(true);
					setDLAadharVoterError(frontOnlyForensicFlagMsg);
					// CONTINUE EXECUTION
				}

				const file2 = {
					...(frontOnlyExtractionRes?.data?.extractionData || {}),
					document_key: frontOnlyExtractionRes?.data?.s3?.fd,
					id: Math.random()
						.toString(36)
						.replace(/[^a-z]+/g, '')
						.substr(0, 6),
					mainType: 'KYC',
					size: frontOnlyExtractionRes?.data?.s3?.size,
					type: 'other',
					req_type: fileType,
					requestId: frontOnlyExtractionRes?.data?.request_id,
					upload_doc_name: frontOnlyExtractionRes?.data?.s3?.filename,
					isDocRemoveAllowed: false,
				};

				setLoanDocuments([file2]);
				// this ends here
				prepopulateAadhaarAndAddressState(
					frontOnlyExtractionRes?.data?.extractionData || {}
				);
				// TODO: Remove this code
				// const aadharNum = frontOnlyExtractionRes?.data?.extractionData?.Aadhar_number?.replaceAll(
				// 	/\s/g,
				// 	''
				// ).split('');
				// formState.values.aadhaarUnMasked = aadharNum?.join('') || '';
				// const t = aadharNum
				// 	? '00000000' + aadharNum?.splice(8, 4).join('')
				// 	: '';
				// const name =
				// 	frontOnlyExtractionRes?.data?.extractionData?.name?.split(' ') ||
				// 	frontOnlyExtractionRes?.data?.extractionData?.Name?.split(' ');
				// formState.values.aadhaar = t;
				// sessionStorage.setItem('aadhar', t);
				// formState.values.dob =
				// 	frontOnlyExtractionRes?.data?.extractionData?.DOB;
				// let fName = [...name];
				// fName.pop();
				// formState.values.firstName = fName.join(' ');
				// formState.values.lastName = name[name.length - 1];

				// formState.values.dob =
				// 	frontOnlyExtractionRes?.data?.extractionData?.DOB ||
				// 	frontOnlyExtractionRes?.data?.extractionData?.dob;
				// formState.values.dl_no =
				// 	frontOnlyExtractionRes?.data?.extractionData?.dl_no;
				// formState.values.address1 =
				// 	frontOnlyExtractionRes.data?.extractionData?.address ||
				// 	frontOnlyExtractionRes?.data?.extractionData?.Address;
				// let address = formState.values.address1;

				// var pinCode = frontOnlyExtractionRes?.data?.extractionData?.pincode;

				// if (address) {
				// 	let locationArr = address && address?.split(' ');
				// 	let y = locationArr?.map(e => Number(e) !== NaN && e);
				// 	let pin;
				// 	y.map(e => {
				// 		if (e?.length === 6) pin = e;
				// 	});

				// 	formState.values.pin = pinCode || pin;
				// }

				// sessionStorage.setItem('formstate', JSON.stringify(formState));

				emptyDoc();
				if (frontOnlyForensicFlag !== 'warning') onProceed();
				setLoading(false);
			}
		} catch (error) {
			console.error('error-pan-verification-handleUpload-', error);
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
								sectionType='pan'
								pan={true}
								disabled={panFile.length > 0 ? true : false}
								onDrop={handleFileUpload}
								onRemoveFile={e => removeHandler(e)}
								docs={docs}
								setDocs={setDocs}
								errorMessage={panError}
								errorType={panError && (isWarning ? 'warning' : 'error')}
							/>

							{panError && (
								<p
									style={{
										color: isWarning ? '#f7941d' : '#de524c',
										marginTop: '-100px',
									}}>
									<NotificationImg
										src={isWarning ? WarnIcon : ErrorIcon}
										alt='error'
									/>
									{panError}
									{/* <Span>supported formats - jpeg, png, jpg</Span> */}
								</p>
							)}
							<section style={{ marginTop: panError ? 100 : 20 }}>
								{isWarning ? (
									<Button
										onClick={() => {
											setLoading(false);
											setPanConfirm(true);
											// resetAllErrors();
											// TODO: Keep this commented till new solution is finalized
											// if (productType === 'business' && isBusiness) {
											// 	onSubmit(formState);
											// 	return;
											// }
											// if (productType === 'business') {
											// 	setPanUpload(false);
											// 	setUploadOtherDocs(false);
											// 	return;
											// }
											// if (productType === 'salaried') {
											// 	setPanConfirm(true);
											// }
										}}
										name={'Proceed'}
										fill
									/>
								) : (
									<Button
										onClick={() => {
											if (docs.length > 0) {
												handlePanUpload(docs[0].file);
												// setDocs([]);
											}
										}}
										isLoader={loading}
										name={loading ? 'Please wait...' : 'Proceed'}
										// disabled={!docs.length > 0}
										disabled={!docs.length > 0 || isError || loading}
										fill
									/>
								)}
							</section>
						</section>
					) : (
						<form onSubmit={handleSubmit(onSubmit)}>
							{uploadOtherDocs ? (
								<>
									{/* <p className='py-4 text-xl text-black'>
										Upload{' '}
										{(backUploading && 'back picture of') || 'front picture of'}{' '}
										your DL
										<span>supported formats - jpeg, png, jpg</span>
									</p> */}
									<h1 className='py-4 text-xl text-black'>
										{' '}
										Select and Upload any one of the doccument metions below
									</h1>
									<section className='flex gap-x-4 items-center'>
										<section style={{ padding: '7px' }}>
											<Cardstyle>
												<input
													type='radio'
													value='aadhar'
													style={{
														height: '16px',
														width: '16px',
														marginRight: '18px',
													}}
													onChange={() => setSelectedAddressProof('aadhar')}
													checked={selectedAddressProof === 'aadhar'}
												/>
												<label style={{ marginLeft: '10px' }}>Aadhar</label>
											</Cardstyle>
										</section>
										<section style={{ padding: '7px' }}>
											<Cardstyle>
												<input
													type='radio'
													value='voter'
													style={{
														height: '16px',
														width: '16px',
														marginRight: '18px',
													}}
													onChange={() => setSelectedAddressProof('voter')}
													checked={selectedAddressProof === 'voter'}
												/>
												<label>VoterID</label>
											</Cardstyle>
										</section>
										<section style={{ padding: '7px' }}>
											<Cardstyle>
												<input
													type='radio'
													value='DL'
													style={{
														height: '16px',
														width: '16px',
														marginRight: '10px',
													}}
													onChange={() => setSelectedAddressProof('DL')}
													checked={selectedAddressProof === 'DL'}
												/>
												<label style={{ marginLeft: '7px' }}>DL</label>
											</Cardstyle>
										</section>
										<section>
											<Cardstyle style={{ padding: '7px' }}>
												<input
													type='radio'
													value='passport'
													style={{
														height: '16px',
														width: '16px',
														marginRight: '18px',
													}}
													onChange={() => setSelectedAddressProof('passport')}
													checked={selectedAddressProof === 'passport'}
												/>
												<label style={{ marginLeft: '10px' }}>PassPort</label>
											</Cardstyle>
										</section>
									</section>
									<FileUpload
										section={'pan-verification'}
										accept=''
										upload={true}
										pan={true}
										docTypeOptions={getDocumentTypeList(selectedAddressProof)}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={docId => removeHandler(docId)}
										docs={addressProofDocs}
										setDocs={setAddressProofDocs}
										aadharVoterDl={true}
										errorMessage={dlError || aadharError || voterError || ''}
										errorType={
											(dlError || aadharError || voterError || '') &&
											(isWarning ? 'warning' : 'error')
										}
									/>
									{(dlError || aadharError || voterError) && (
										<p
											style={{
												color: isWarning ? '#f7941d' : '#de524c',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											<NotificationImg
												src={isWarning ? WarnIcon : ErrorIcon}
												alt='error'
											/>
											{dlError || aadharError || voterError || ''}
										</p>
									)}
									{/* <h1
										className='text-xl text-black'
										style={{ marginLeft: '50%' }}>
										OR
									</h1>
									<p className='py-4 text-xl text-black'>
										Upload{' '}
										{(backUploading && 'back picture of') || 'front picture of'}{' '}
										your Aadhaar
									</p>

									<FileUpload
										accept=''
										upload={true}
										pan={true}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={docId => removeHandler(docId)}
										docs={addressProofDocs}
										setDocs={setAddressProofDocs}
										aadharVoterDl={true}
										errorMessage={aadharError}
										errorType={aadharError && (isWarning ? 'warning' : 'error')}
									/>
									{aadharError.length > 0 && (
										<p
											style={{
												color: isWarning ? '#f7941d' : '#de524c',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											<NotificationImg
												src={isWarning ? WarnIcon : ErrorIcon}
												alt='error'
											/>
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
									</p>

									<FileUpload
										accept=''
										upload={true}
										pan={true}
										sectionType='pan'
										onDrop={handleFileUpload}
										onRemoveFile={e => removeHandler(e, voter, 'voter')}
										docs={voter}
										setDocs={setVoter}
										aadharVoterDl={true}
										errorMessage={voterError}
										errorType={voterError && (isWarning ? 'warning' : 'error')}
									/>
									{voterError.length > 0 && (
										<p
											style={{
												color: isWarning ? '#f7941d' : '#de524c',
												marginTop: '-25px',
												marginBottom: '45px',
											}}>
											<NotificationImg
												src={isWarning ? WarnIcon : ErrorIcon}
												alt='error'
											/>
											{voterError}
										</p>
									)} */}
									<section>
										{selectedAddressProof === 'aadhar' && (
											<>
												{' '}
												<input
													type='checkbox'
													defaultChecked={isAddharSkipChecked}
													onChange={() =>
														setIsAddharSkipChecked(!isAddharSkipChecked)
													}
												/>
												<label style={{ padding: '10px' }}>
													I would like to skip aadhaar document upload and
													verify it later using OTP
												</label>
											</>
										)}
									</section>
								</>
							) : (
								<>
									<FieldWrapper>
										{register({
											name: 'panNumber',
											placeholder: 'Pan Number',
											value:
												formState?.values?.panNumber ||
												sessionStorage.getItem('pan'),
											disabled: true,
											readonly: true,
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
								{uploadOtherDocs && isWarning ? (
									<Button
										onClick={() => {
											onProceed();
										}}
										disabled={!selectedAddressProof}
										name={'Proceed'}
										fill
									/>
								) : (
									<Button
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
													  (verificationFailed &&
															verificationFailed.length > 0)
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
								)}
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
								// onClick={() => {
								// 	sessionStorage.setItem('pan', formState?.values?.panNumber);
								// 	setPanConfirm(false);
								// 	setPanUpload(false);
								// 	if (productType === 'salaried') {
								// 		setUploadOtherDocs(true);
								// 	}
								// }}
								// disabled={!formState?.values?.panNumber}
								loading={loading}
								onClick={handlePanConfirm}
								disabled={!formState?.values?.panNumber || loading}
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
