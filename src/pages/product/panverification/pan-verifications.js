/* Pan verification page
- This section has 2 screens
- 1 pan upload screen
- 2 gst udhyog screen
- 3 address proof upload screen (aadhaar-voter-dl-passport)
*/

import { useState, useContext, useEffect, useRef } from 'react';
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
} from '../../../_config/app.config';
import {
	getKYCData,
	verifyPan,
	gstFetch,
	getKYCDataId,
	verifyKycDataUiUx,
} from '../../../utils/request';
import _, { set } from 'lodash';

import * as CONST from './const';
import * as UI from './ui';
import InputField from 'components/inputs/InputField';

const Wrapper = styled.div`
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

const CardRadioButton = styled.div`
	/* box-shadow: 0 4px 9px 0 #bdd2ef; */
	box-shadow: rgb(11 92 255 / 16%) 0px 2px 5px 1px;
	width: 180px;
	height: 45px;
	line-height: 45px;
	margin-right: 20px;
	padding-left: 20px;
	border-radius: 6px;
	text-align: left;
	input {
		cursor: pointer;
	}
	label {
		padding-left: 15px;
		cursor: pointer;
	}
`;

const RadioButtonWrapper = styled.div`
	padding: 30px 0;
	display: flex;
`;

const ButtonWrapper = styled.div`
	margin-top: 20px;
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

export default function PanVerification({
	productDetails,
	map,
	onFlowChange,
	id,
}) {
	const productType =
		productDetails.loan_request_type === 1 ? 'business' : 'salaried';
	const isBusinessProductType = productType === 'business';
	const isSalariedProductType = !isBusinessProductType; // 'salaried'
	const isVerifyKycData = productDetails?.kyc_verification; // TODO: make it to false before pushing
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
		state: { documents: loanDocuments },
		actions: {
			setLoanDocuments,
			removeAllLoanDocuments,
			setLoanDocumentType,
			removeLoanDocument,
			removeAllAddressProofLoanDocuments,
		},
	} = useContext(LoanFormContext);

	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();
	const { addToast } = useToasts();

	const [loading, setLoading] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const [isCompanyListModalOpen, setIsCompanyListModalOpen] = useState(false);
	// const [dlError, setDLError] = useState('');
	// const [aadharError, setAadharError] = useState('');
	// const [voterError, setVoterError] = useState('');
	const [panError, setPanError] = useState('');
	const [addressProofError, setAddressProofError] = useState('');
	const [udhyogError, setUdhyogError] = useState('');
	const [gstError, setGstError] = useState('');
	// const [selectDoc, selectDocs] = useState(false);
	// const [verificationFailed, setVerificationFailed] = useState('');
	//const [gstNum, setGstNum] = useState(null);

	const [screen, setScreen] = useState(CONST.SCREEN_PAN);
	// const [screen, setScreen] = useState(CONST.SCREEN_ADDRESS_PROOF);
	// const [panUpload, setPanUpload] = useState(true);
	// const [file, setFile] = useState([]);
	// const fileRef = useRef([]);
	// const [panFile, setPanFile] = useState([]);
	const [panDoc, setPanDoc] = useState([]);
	//const [panResponse, setPanResponse] = useState(null);
	// const [isBusinessPan, setBusinessPan] = useState(true);

	const product_id = sessionStorage.getItem('productId');

	const [isPanConfirmModalOpen, setIsPanConfirmModalOpen] = useState(false);
	const [isDocTypeChangeModalOpen, setIsDocTypeChangeModalOpen] = useState(
		false
	);
	// this state is to reset all <FileUpload /> document catch
	// to perform this action setRemoveAllFileUploads(!removeAllFileUploads)
	const [removeAllFileUploads, setRemoveAllFileUploads] = useState('');

	// const [uploadOtherDocs, setUploadOtherDocs] = useState(false);
	// const [otherDoc, setOtherDoc] = useState([]);
	// const [aadhar, setAadhar] = useState([]);
	// const [voter, setVoter] = useState([]);

	// const [backUpload, setBackUpload] = useState(false);
	// const [backUploading, setBackUploading] = useState(false);
	// const [disableButton, setDisableSubmit] = useState(false);
	const [panFileId, setPanFileId] = useState(null);
	const [isError, setIsError] = useState(false);
	const [isWarning, setIsWarning] = useState(false);
	const [selectedAddressProof, setSelectedAddressProof] = useState('');
	const [selectedDocTypeList, setSelectedDocTypeList] = useState([]);
	const [isAddharSkipChecked, setIsAddharSkipChecked] = useState(false);
	const [addressProofDocs, setAddressProofDocs] = useState([]);
	const [extractionDataRes, setExtractionDataRes] = useState({});
	const [panExtractionData, setPanExtractionData] = useState({});
	const [addressProofExtractionData, setAddressProofExtractionData] = useState(
		{}
	);
	// const [confirmPanNumber, setConfirmPanNumber] = useState('');
	// const [panNum, setPan] = useState('');
	// const userid = '10626';

	const resetAllErrors = () => {
		setPanError('');
		setAddressProofError('');
		setGstError('');
		setUdhyogError('');
		setIsError(false);
		setIsWarning(false);
	};

	const onCompanySelect = cinNumber => {
		setIsCompanyListModalOpen(false);
		setLoading(true);
		cinNumberFetch(cinNumber);
	};

	const proceedToNextSection = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	const getVerifiedKycData = async (selectedAddressProof, extractionData) => {
		try {
			// console.log('getVerifiedKycData-', {
			// 	selectedAddressProof,
			// 	isVerifyKycData,
			// 	extractionData,
			// });
			if (
				isVerifyKycData &&
				selectedAddressProof !== CONST.EXTRACTION_KEY_AADHAAR
			) {
				const reqBody = {
					doc_ref_id:
						selectedAddressProof === CONST.EXTRACTION_KEY_PAN
							? extractionData?.doc_ref_id
							: extractionData?.doc_ref_id,
					doc_type: selectedAddressProof,
				};
				if (selectedAddressProof === CONST.EXTRACTION_KEY_PAN) {
					reqBody.number = extractionData.panNumber || '';
					reqBody.name = extractionData.companyName || '';
				}
				if (selectedAddressProof === CONST.EXTRACTION_KEY_DL) {
					reqBody.number = extractionData?.dl_no || '';
					reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
				}
				if (selectedAddressProof === CONST.EXTRACTION_KEY_VOTERID) {
					reqBody.number = extractionData?.vid || '';
					reqBody.state = extractionData?.state || '';
					reqBody.name = extractionData?.Name || extractionData?.name || '';
				}
				if (selectedAddressProof === CONST.EXTRACTION_KEY_PASSPORT) {
					// TODO: verify by testing passport extraction data
					reqBody.number = extractionData?.passport_no || '';
					reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
					reqBody.name = extractionData?.Name || extractionData?.name || '';
				}
				const verifiedRes = await verifyKycDataUiUx(reqBody, clientToken);
				return verifiedRes;
			} else return {};
		} catch (error) {
			console.error('error-verifyKycDataUiUx-', error);
			addToast({
				message: error.message || 'Something Went Wrong. Try Again!',
				type: 'error',
			});
			return {};
		}
	};

	const companyNameSearch = async companyName => {
		try {
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
				return companyNameSearchRes.data;
			}
			return [];
		} catch (error) {
			console.error('error-companyNameSearch-', error);
			addToast({
				message: error.message || 'Company search failed, try again',
				type: 'error',
			});
			return [];
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
						...formatCompanyData(companyData.data, extractionDataRes.panNumber),
					});
				proceedToNextSection();
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
			...formatCompanyDataGST(companyData, extractionDataRes.panNumber, gstNum),
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
						...formatCompanyDataGST(
							companyData,
							extractionDataRes.panNumber,
							gstNum
						),
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

		proceedToNextSection();
		return;
	};

	useEffect(() => {
		setSelectedDocTypeList(CONST.getDocumentTypeList(selectedAddressProof));
	}, [selectedAddressProof]);

	useEffect(() => {
		sessionStorage.removeItem('product');
		// removeAllLoanDocuments();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		resetAllErrors();
		// eslint-disable-next-line
	}, [formState?.values?.gstin, formState?.values?.udhyogAadhar]);

	if (!productDetails) return null;

	const handleFileUploadPan = files => {
		setPanDoc(files);
		// setDisableSubmit(false);
		resetAllErrors();
		setIsError(false);
		removeAllLoanDocuments();
		// TODO: cleanup
		// const newFiles = [];
		// fileRef.current.map(f => newFiles.push({ ...f }));
		// files.map(f => newFiles.push({ ...f }));
		// console.log('pan-verification-handleFileUpload-', { newFiles });
		// fileRef.current = newFiles;
		// setFile(newFiles);
		// setPanFile(newFiles);
	};
	const onProceedGstUdhyog = async data => {
		const { panNumber, gstin, udhyogAadhar } = data;
		try {
			setLoading(true);
			resetAllErrors();
			let isError = false;
			//setGstNum(gstin);
			sessionStorage.setItem('product', 'udhyog');
			if (!udhyogAadhar && !gstin) {
				setLoading(false);
				isError = true;
			}
			if (udhyogAadhar && udhyogAadhar.length !== 12) {
				setUdhyogError('Udhyog aadhaar should be 12 digit');
				setLoading(false);
				isError = true;
			}
			if (gstin && gstin.length !== 15) {
				setGstError('GSTIN should be 15 digit');
				setLoading(false);
				isError = true;
			}
			if (udhyogAadhar && udhyogAadhar.length === 12) proceedToNextSection();
			if (isError) return;
			let stateCode = null;
			let panFromGstin = null;
			if (gstin) {
				stateCode = gstin.slice(0, 2);
				panFromGstin = gstin.slice(2, 12);
				const restGstin = gstin.slice(12, 15);

				const lastthreeDigitsValidation = /[1-9A-Z]{1}Z[0-9A-Z]{1}/.test(
					restGstin
				);
				const stateCodeValidation = /[0-9]/.test(stateCode);
				if (!lastthreeDigitsValidation || !stateCodeValidation) {
					setGstError('Please specify a valid GSTIN');
					setLoading(false);
					return;
				}
				if (panFromGstin !== panNumber || !lastthreeDigitsValidation) {
					setGstError('Invalid GSTIN for the given PAN');
					setLoading(false);
					return;
				}
			}

			await gstFetch(panNumber, stateCode, gstin, clientToken).then(res => {
				if (res?.data?.status === 'nok') {
					setGstError('Invalid GSTIN pattern');
					setLoading(false);
					return;
				} else if (res?.data?.data?.error_code) {
					setGstError(res?.data?.data.message);
					setLoading(false);
					return;
				} else
					gstNumberFetch(res?.data?.data[0]?.data || res?.data?.data, gstin);
			});
		} catch (error) {
			console.error('error-onProceedGstUdhyog-', error);
			addToast({
				message: error.message || 'Something Went Wrong. Try Again!',
				type: 'error',
			});
		}
	};
	// TODO: remove this not required
	// useEffect(() => {
	// 	if (aadhar.length > 0 || voter.length > 0 || otherDoc.length > 0)
	// 		setBackUpload(true);
	// }, [otherDoc, aadhar, voter, backUploading]);

	const handleFileRemovePan = docId => {
		//console.log('handleFileRemovePan docId-', docId);
		removeAllFileUploads();
		resetAllErrors();
		setPanDoc([]);
		// var index3 = file.findIndex(x => x.id === docId);
		// file.splice(index3, 1);
		// setFile(file);
		// fileRef.current = file;
		// setPanFile([]);
	};

	const onChangePanNumber = e => {
		const newPanExtractionData = _.cloneDeep(panExtractionData);
		newPanExtractionData.panNumber = e.target.value;
		setPanExtractionData(newPanExtractionData);
	};

	const onProceedPanConfirm = async () => {
		try {
			// Validate pan field
			// validate pan length
			// validate pan with digit + alphabets
			setLoading(true);
			// call verifykyc api
			const verifiedRes = await getVerifiedKycData(
				CONST.EXTRACTION_KEY_PAN,
				panExtractionData
			);
			// console.log(
			// 	'pan-verification-handlePanConfirm-verifiedRes-',
			// 	verifiedRes
			// );

			// const businessDetails = {
			// 	...extractionDataRes,
			// };

			// put all require condition for next screen here
			// don't change 'pan' to different key it'll effect prepopulation logic
			sessionStorage.setItem('pan', panExtractionData?.panNumber);

			// business product + business pan card
			if (isBusinessProductType && panExtractionData.isBusinessPan) {
				// TODO: simplify below logic
				// if (
				// 	panExtractionData.panNumber &&
				// 	panExtractionData.companyName &&
				// 	panExtractionData.responseId
				// ) {
				// 	// TODO: confirm why do we need 2 verify api
				// 	await verifyPan(
				// 		panExtractionData.responseId,
				// 		panExtractionData.panNumber,
				// 		panExtractionData.companyName,
				// 		clientToken
				// 	);
				// }
				const newCompanyList = await companyNameSearch(
					panExtractionData.companyName
				);
				setCompanyList(newCompanyList);
				setIsPanConfirmModalOpen(false);
				setIsCompanyListModalOpen(true);
				setLoading(false);
				return;
			}
			// business product + personal pan card
			if (isBusinessProductType) {
				// TODO: confirm and remove verifyPan
				// if (
				// 	extractionDataRes.panNumber &&
				// 	formState?.values?.companyName &&
				// 	formState.values.responseId
				// ) {
				// 	await verifyPan(
				// 		formState.values.responseId,
				// 		extractionDataRes.panNumber,
				// 		formState?.values?.companyName,
				// 		clientToken
				// 	);
				// }
				setIsPanConfirmModalOpen(false);
				setLoading(false);
				setScreen(CONST.SCREEN_GST_UDHYOG);
				return;
			}
			// salaried product + personal pan card
			if (isSalariedProductType) {
				// TODO: confirm and remove verify pan
				// if (
				// 	extractionDataRes.panNumber &&
				// 	formState?.values?.companyName &&
				// 	formState.values.responseId
				// ) {
				// 	await verifyPan(
				// 		formState.values.responseId,
				// 		extractionDataRes.panNumber,
				// 		formState?.values?.companyName,
				// 		clientToken
				// 	);
				// }
				resetAllErrors();
				setIsPanConfirmModalOpen(false);
				setLoading(false);
				setScreen(CONST.SCREEN_ADDRESS_PROOF);
			}
			setLoading(false);
			setIsPanConfirmModalOpen(false);
		} catch (error) {
			console.error('error-handlePanConfirm-', error);
		}
	};

	// Pancard extraction function
	const handleExtractionPan = async () => {
		try {
			//	console.log('handleExtractionPan-', panDoc);
			setLoading(true);
			const formData = new FormData();
			formData.append('product_id', product_id);
			formData.append('req_type', CONST.EXTRACTION_KEY_PAN);
			formData.append('process_type', 'extraction');
			formData.append('document', panDoc[0].file);

			const panExtractionRes = await getKYCData(formData, clientToken);
			const panExtractionStatus = panExtractionRes?.data?.status || '';
			const panExtractionMsg = panExtractionRes?.data?.message || '';
			const panForensicRes = panExtractionRes?.data?.forensicData || {};
			const panForensicFlag = panForensicRes?.flag?.toLowerCase() || '';
			const panForensicFlagMsg = panForensicRes?.flag_message || '';
			// console.log('handleExtractionPan-', {
			// 	panExtractionRes,
			// 	panExtractionStatus,
			// 	panExtractionMsg,
			// 	panForensicRes,
			// 	panForensicFlag,
			// 	panForensicFlagMsg,
			// });
			if (panExtractionStatus === 'nok') {
				// setIsPanConfirmModalOpen(true);
				// setBusinessPan(false);
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
				type: CONST.EXTRACTION_KEY_PAN,
				req_type: CONST.EXTRACTION_KEY_PAN, // requires for mapping with JSON
				requestId: panExtractionRes?.data?.request_id,
				upload_doc_name: panExtractionRes?.data.s3.filename,
				isDocRemoveAllowed: false,
			};
			setPanFileId(file1.id);
			setLoanDocuments([file1]);
			const newPanExtractionData = _.cloneDeep(
				panExtractionRes?.data?.extractionData || {}
			);
			newPanExtractionData.doc_ref_id =
				panExtractionRes?.data?.doc_ref_id || '';
			newPanExtractionData.requestId = panExtractionRes?.data?.request_id || '';
			newPanExtractionData.panNumber = newPanExtractionData?.Pan_number || '';
			newPanExtractionData.responseId = newPanExtractionData?.id || '';
			newPanExtractionData.dob = newPanExtractionData?.DOB || '';
			newPanExtractionData.isBusinessPan =
				CONST.isBusinessPan(
					newPanExtractionData?.Name || newPanExtractionData?.name
				) || false;
			newPanExtractionData.companyName = newPanExtractionData?.Name || '';
			if (isSalariedProductType) {
				const name =
					newPanExtractionData?.name?.split(' ') ||
					newPanExtractionData?.Name?.split(' ');
				if (name) {
					newPanExtractionData.firstName = name[0];
					newPanExtractionData.lastName = name[1];
				}
			}
			const newFormState = _.cloneDeep(formState);
			newFormState.values = newPanExtractionData;
			// TODO: remove this in future
			sessionStorage.setItem('formstatepan', JSON.stringify(newFormState));
			sessionStorage.setItem(
				'panExtractionData',
				JSON.stringify(newPanExtractionData)
			);
			setExtractionDataRes(panExtractionRes?.data || {});
			setPanExtractionData(newPanExtractionData);
			// fileRef.current = [];
			setLoading(false);
			if (panForensicFlag !== 'warning') setIsPanConfirmModalOpen(true);
		} catch (error) {
			console.error('error-pan-verification-handleExtractionPan-', error);
			setLoading(false);
			setIsPanConfirmModalOpen(true);
			addToast({
				message: error.message,
				type: 'error',
			});
		}
	};

	const prepopulateAadhaarAndAddressState = extractionData => {
		const newAddressProofExtractionData = _.cloneDeep(extractionData);
		// console.log('prepopulateAadhaarAndAddressState-', extractionData);
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

		setAddressProofExtractionData({
			...newAddressProofExtractionData,
			...formState.values,
		});
		sessionStorage.setItem('formstate', JSON.stringify(formState));
	};

	const handleFileUploadAddressProof = files => {
		// const newFiles = _.cloneDeep(fileRef.current);
		// fileRef.current.map(f => newFiles.push({ ...f }));
		// files.map(f => newFiles.push({ ...f }));
		// console.log('pan-verification-handleFileUpload-', { newFiles });
		// fileRef.current = newFiles;
		// setFile(newFiles);
		// if (screen === CONST.SCREEN_PAN) setPanFile(newFiles);
		const newFiles = _.cloneDeep(addressProofDocs);
		files.map(f => newFiles.push(_.cloneDeep(f)));
		if (selectedAddressProof) setAddressProofDocs(newFiles);
		// setDisableSubmit(false);
		setIsAddharSkipChecked(false);
		resetAllErrors();
		setIsError(false);
	};

	const handleFileRemoveAddressProof = docId => {
		//console.log('handleFileRemoveAddressProof docId-', docId);
		removeAllAddressProofLoanDocuments();
		resetAllErrors();
		// const newAddressProofDocs = _.cloneDeep(
		// 	// eslint-disable-next-line
		// 	fileRef.current.filter(f => f.id != docId)
		// );
		// fileRef.current = newAddressProofDocs;
		const newAddressProofDocs = _.cloneDeep(
			addressProofDocs.filter(f => f.id !== docId)
		);
		setAddressProofDocs(newAddressProofDocs);
	};

	// Address proof upload handle function
	// DL Aadhaar VoterID passport
	//TO DO  need to call in proceed button of otherdocuments
	const handleExtractionAddressProof = async () => {
		try {
			setLoading(true);
			resetAllErrors();
			// TODO Filter selected address proof docs before extracting
			const selectedAddressProofFiles = addressProofDocs.filter(
				f => f?.sectionType === selectedAddressProof
			);
			if (selectedAddressProofFiles.length > 2) {
				addToast({
					message: 'Max 2 doucment is allowed',
					type: 'error',
				});
				setLoading(false);
				return;
			}
			// console.log(
			// 	'handleExtractionAddressProof-selectedAddressProofFiles-',
			// 	selectedAddressProofFiles
			// );

			// Front + Back Extract
			if (selectedAddressProofFiles.length > 1) {
				const frontFormData = new FormData();
				frontFormData.append('product_id', product_id);
				frontFormData.append('req_type', selectedAddressProof);
				frontFormData.append('process_type', 'extraction');
				frontFormData.append('document', selectedAddressProofFiles[0].file);

				const frontExtractionRes = await getKYCData(frontFormData, clientToken);
				const frontExtractionStatus = frontExtractionRes?.data?.status || '';
				const frontExtractionMsg = frontExtractionRes?.data?.message || '';
				const frontForensicRes = frontExtractionRes?.data?.forensicData || {};
				const frontForensicFlag = frontForensicRes?.flag?.toLowerCase() || '';
				const frontForensicFlagMsg = frontForensicRes?.flag_message || '';

				if (frontExtractionStatus === 'nok') {
					setIsError(true);
					setAddressProofError(frontExtractionMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'error') {
					setIsError(true);
					setAddressProofError(frontForensicFlagMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'warning') {
					setIsWarning(true);
					setAddressProofError(frontForensicFlagMsg);
					// CONTINUE EXECUTION
				}

				const frontFile = {
					...(frontExtractionRes?.data?.extractionData || {}),
					document_key: frontExtractionRes?.data?.s3?.fd,
					id: selectedAddressProofFiles[0].id,
					// id: Math.random()
					// 	.toString(36)
					// 	.replace(/[^a-z]+/g, '')
					// 	.substr(0, 6),
					mainType: 'KYC',
					size: frontExtractionRes?.data?.s3?.size,
					type: 'other',
					req_type: selectedAddressProof, // requires for mapping with JSON
					requestId: frontExtractionRes?.data?.request_id,
					upload_doc_name: frontExtractionRes?.data?.s3?.filename,
					isDocRemoveAllowed: false,
				};

				setLoanDocuments([frontFile]);
				// this ends here

				const backFormData = new FormData();
				backFormData.append('product_id', product_id);
				backFormData.append('req_type', selectedAddressProof);
				backFormData.append(
					'ref_id',
					frontExtractionRes?.data?.extractionData?.id
				);
				backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
				backFormData.append('process_type', 'extraction');
				backFormData.append('document', selectedAddressProofFiles[1].file);

				const backExtractionRes = await getKYCDataId(backFormData, clientToken);
				const backExtractionStatus = backExtractionRes?.data?.status || '';
				const backExtractionMsg = backExtractionRes?.data?.message || '';
				const backForensicRes = backExtractionRes?.data?.forensicData || {};
				const backForensicFlag = backForensicRes?.flag?.toLowerCase() || '';
				const backForensicFlagMsg = backForensicRes?.flag_message || '';

				if (backExtractionStatus === 'nok') {
					setIsError(true);
					setAddressProofError(backExtractionMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'error') {
					setIsError(true);
					setAddressProofError(backForensicFlagMsg);
					setLoading(false);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'warning') {
					setIsWarning(true);
					setAddressProofError(backForensicFlagMsg);
					// CONTINUE EXECUTION
				}

				const backFile = {
					...(backExtractionRes?.data?.extractionData || {}),
					document_key: backExtractionRes?.data.s3.fd,
					id: selectedAddressProofFiles[1].id,
					// id: Math.random()
					// 	.toString(36)
					// 	.replace(/[^a-z]+/g, '')
					// 	.substr(0, 6),
					mainType: 'KYC',
					size: backExtractionRes?.data.s3.size,
					type: 'other',
					req_type: selectedAddressProof,
					requestId: backExtractionRes?.data.request_id,
					upload_doc_name: backExtractionRes?.data.s3.filename,
					isDocRemoveAllowed: false,
				};

				setLoanDocuments([backFile]);
				// this ends here
				setExtractionDataRes(backExtractionRes?.data || {});
				const newAddressProofExtractionData = {
					...backExtractionRes?.data?.extractionData,
					doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
					requestId: backExtractionRes?.data.request_id,
				};
				prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
				getVerifiedKycData(selectedAddressProof, newAddressProofExtractionData);
				if (backForensicRes !== 'warning') proceedToNextSection();
				setLoading(false);
				return;
			}

			// Front Only Extract
			const frontOnlyFormData = new FormData();
			frontOnlyFormData.append('product_id', product_id);
			frontOnlyFormData.append('req_type', selectedAddressProof);
			frontOnlyFormData.append('process_type', 'extraction');
			frontOnlyFormData.append('document', selectedAddressProofFiles[0].file);

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
			const frontOnlyForensicFlagMsg = frontOnlyForensicRes?.flag_message || '';

			if (frontOnlyExtractionStatus === 'nok') {
				setIsError(true);
				setAddressProofError(frontOnlyExtractionMsg);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'error') {
				setIsError(true);
				setAddressProofError(frontOnlyForensicFlagMsg);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'warning') {
				setIsWarning(true);
				setAddressProofError(frontOnlyForensicFlagMsg);
				// CONTINUE EXECUTION
			}

			const frontOnlyFile = {
				...(frontOnlyExtractionRes?.data?.extractionData || {}),
				document_key: frontOnlyExtractionRes?.data?.s3?.fd,
				id: selectedAddressProofFiles[0].id,
				// id: Math.random()
				// 	.toString(36)
				// 	.replace(/[^a-z]+/g, '')
				// 	.substr(0, 6),
				mainType: 'KYC',
				size: frontOnlyExtractionRes?.data?.s3?.size,
				type: 'other',
				req_type: selectedAddressProof,
				requestId: frontOnlyExtractionRes?.data?.request_id,
				upload_doc_name: frontOnlyExtractionRes?.data?.s3?.filename,
				isDocRemoveAllowed: false,
			};

			setLoanDocuments([frontOnlyFile]);
			// this ends here
			setExtractionDataRes(frontOnlyExtractionRes?.data || {});
			const newAddressProofExtractionData = {
				...(frontOnlyExtractionRes?.data?.extractionData || {}),
				doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
				requestId: frontOnlyExtractionRes?.data?.request_id,
			};
			prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
			getVerifiedKycData(selectedAddressProof, newAddressProofExtractionData);
			if (frontOnlyForensicFlag !== 'warning') proceedToNextSection();
			setLoading(false);
		} catch (error) {
			console.error(
				'error-pan-verification-handleExtractionAddressProof-',
				error
			);
		}
	};

	// const emptyDoc = () => {
	// 	setOtherDoc([]);
	// 	setAadhar([]);
	// 	setVoter([]);
	// };

	// const setAddressProofError = message => {
	// 	setAddressProofError(message);
	// 	setLoading(false);
	// };

	const handleDocumentTypeChangeAddressProof = async (fileId, type) => {
		setLoanDocumentType(fileId, type);
		// const newAddressProofDocs = fileRef.current || [];
		const newAddressProofDocs = [];
		addressProofDocs.map(f => {
			const newFile = _.cloneDeep(f);
			if (f.id === fileId) {
				newFile.isTagged = type;
			}
			newAddressProofDocs.push(newFile);
			return null;
		});
		// fileRef.current = newAddressProofDocs;
		setAddressProofDocs(newAddressProofDocs);
	};

	const onSelectedAddressProofChange = (e, btn) => {
		if (selectedAddressProof && addressProofDocs.length > 0) {
			setIsDocTypeChangeModalOpen(btn.key);
		} else {
			setIsAddharSkipChecked(false);
			setSelectedAddressProof(btn.key);
		}
	};

	let isFrontTagged = false;
	let isBackTagged = false;
	let isFrontBackTagged = false;
	let isInActiveAddressProofUpload = false;
	let isProceedDisabledAddressProof = true;
	let isSkipOptionDisabled = false;
	let isProceedDIsabledGstUdhyog = false;

	if (!selectedAddressProof) {
		isProceedDisabledAddressProof = true;
		isInActiveAddressProofUpload = true;
	}
	if (selectedAddressProof) {
		const isFrontTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[0].id
			).length > 0;
		const isBackTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[1].id
			).length > 0;
		const isFrontBackTagged =
			addressProofDocs.filter(
				f => f?.isTagged?.id === selectedDocTypeList[2].id
			).length > 0;
		if (addressProofDocs.length > 0) isSkipOptionDisabled = true;
		if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (isFrontBackTagged && !isFrontTagged && !isBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (addressProofDocs.filter(f => !f?.isTagged?.id).length > 0) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = true;
		}
	}
	if (isAddharSkipChecked) {
		isInActiveAddressProofUpload = true;
		isProceedDisabledAddressProof = false;
	}

	if (screen === CONST.SCREEN_GST_UDHYOG) {
		if (gstError) isProceedDIsabledGstUdhyog = true;
		if (udhyogError) isProceedDIsabledGstUdhyog = true;
		if (!formState?.values?.gstin && !formState?.values?.udhyogAadhar)
			isProceedDIsabledGstUdhyog = true;
	}

	if (loading) {
		isProceedDIsabledGstUdhyog = true;
		isProceedDisabledAddressProof = true;
	}

	// console.log('pan-verifications-states-', {
	// 	productDetails,
	// 	isFrontTagged,
	// 	isBackTagged,
	// 	isFrontBackTagged,
	// 	fileRef: fileRef.current,
	// 	loanDocuments,
	// 	addressProofDocs,
	// 	isInActiveAddressProofUpload,
	// 	isProceedDisabledAddressProof,
	// 	formState,
	// 	extractionDataRes,
	// 	panExtractionData,
	// });

	return (
		<Wrapper>
			<CompanySelectModal
				companyNameSearch={companyNameSearch}
				show={isCompanyListModalOpen}
				companyName={formState?.values?.companyName}
				companyList={companyList}
				onClose={() => {
					if (panFileId) removeLoanDocument(panFileId);
					setIsCompanyListModalOpen(false);
				}}
				onCompanySelect={onCompanySelect}
				formState={formState}
			/>
			<Modal
				show={isPanConfirmModalOpen}
				onClose={() => {
					if (panFileId) removeLoanDocument(panFileId);
					setIsPanConfirmModalOpen(false);
				}}
				width='30%'>
				<section className='p-4 flex flex-col gap-y-8'>
					<span>Confirm PAN number and Proceed</span>
					<FieldWrapperPanVerify>
						{/* setConfirmPanNumber */}
						<InputField
							name='panNumber'
							placeholder='Pan Number'
							value={panExtractionData?.panNumber || ''}
							onChange={onChangePanNumber}
						/>
						{/* {register({
							name: 'panNumber',
							placeholder: 'Pan Number',
							value: formState?.values?.panNumber,
						})} */}
					</FieldWrapperPanVerify>
					<Button
						name='Proceed'
						fill
						loading={loading}
						onClick={onProceedPanConfirm}
						disabled={!panExtractionData.panNumber || loading}
						style={{ alignSelf: 'center' }}
					/>
				</section>
			</Modal>
			<Modal
				show={isDocTypeChangeModalOpen}
				onClose={() => {
					setIsDocTypeChangeModalOpen(false);
				}}
				width='50%'
				customStyle={{ minHeight: 200 }}>
				<UI.DocTypeChangeModalBody>
					<UI.DocTypeChangeModalHeader>
						<p className='py-2'>
							<strong>Are you sure want to change documen type?</strong>
						</p>
						<p>
							By changing it, all the existing tagged and untagged document will
							be lost.
						</p>
					</UI.DocTypeChangeModalHeader>
					<UI.DocTypeChangeModalFooter>
						<Button
							name='Confirm'
							fill
							onClick={() => {
								setAddressProofDocs([]);
								removeAllAddressProofLoanDocuments();
								setIsDocTypeChangeModalOpen(false);
								setRemoveAllFileUploads(!removeAllFileUploads);
								resetAllErrors();
								setIsAddharSkipChecked(false);
								setSelectedAddressProof(isDocTypeChangeModalOpen);
							}}
						/>
						<Button
							name='Cancel'
							onClick={() => setIsDocTypeChangeModalOpen(false)}
						/>
					</UI.DocTypeChangeModalFooter>
				</UI.DocTypeChangeModalBody>
			</Modal>
			{screen === CONST.SCREEN_PAN && (
				<section className='flex flex-col gap-y-6'>
					<p className='py-4 text-xl'>
						Upload your PAN Card{' '}
						{/* <Span>supported formats - jpeg, png, jpg</Span> */}
					</p>
					{/* PAN UPLOAD SECTION */}
					<FileUpload
						accept=''
						upload={true}
						sectionType='pan'
						pan={true}
						disabled={panDoc.length > 0 ? true : false}
						onDrop={handleFileUploadPan}
						onRemoveFile={handleFileRemovePan}
						docs={panDoc}
						setDocs={setPanDoc}
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
									setIsPanConfirmModalOpen(true);
									// resetAllErrors();
									// TODO: Keep this commented till new solution is finalized
									// if (isBusinessProductType && isBusiness) {
									// 	onSubmit(formState);
									// 	return;
									// }
									// if (isBusinessProductType) {
									// 	setPanUpload(false);
									// 	setUploadOtherDocs(false);
									// 	return;
									// }
									// if (isSalariedProductType) {
									// 	setIsPanConfirmModalOpen(true);
									// }
								}}
								name={'Proceed'}
								fill
							/>
						) : (
							<Button
								onClick={handleExtractionPan}
								isLoader={loading}
								name={loading ? 'Please wait...' : 'Proceed'}
								// disabled={!docs.length > 0}
								disabled={!panDoc.length > 0 || isError || loading}
								fill
							/>
						)}
					</section>
				</section>
			)}
			{screen === CONST.SCREEN_ADDRESS_PROOF && (
				<section>
					<h1 className='text-xl text-black'>
						Select and Upload any one of the doccument metions below
					</h1>
					<RadioButtonWrapper>
						{CONST.addressProofRadioButtonList.map(btn => {
							return (
								<CardRadioButton key={btn.key}>
									<input
										id={btn.key}
										type='radio'
										value={btn.key}
										onChange={e => onSelectedAddressProofChange(e, btn)}
										checked={selectedAddressProof === btn.key}
									/>
									<label htmlFor={btn.key} style={{ marginLeft: '10px' }}>
										{btn.name}
									</label>
								</CardRadioButton>
							);
						})}
					</RadioButtonWrapper>
					<div
						onClick={e => {
							if (isInActiveAddressProofUpload) {
								e.preventDefault();
								e.stopPropagation();
							}
						}}>
						{/* ADDRESS PROOF UPLOAD SECTION */}
						<FileUpload
							isInActive={isInActiveAddressProofUpload}
							section={'addressproof'}
							accept=''
							upload={true}
							pan={true}
							docTypeOptions={selectedDocTypeList}
							sectionType={selectedAddressProof}
							onDrop={handleFileUploadAddressProof}
							onRemoveFile={handleFileRemoveAddressProof}
							docs={addressProofDocs}
							setDocs={setAddressProofDocs}
							documentTypeChangeCallback={handleDocumentTypeChangeAddressProof}
							aadharVoterDl={true}
							errorMessage={addressProofError}
							errorType={addressProofError && (isWarning ? 'warning' : 'error')}
							removeAllFileUploads={removeAllFileUploads}
						/>
					</div>
					{addressProofError && (
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
							{addressProofError}
						</p>
					)}
					<UI.SkipAadhaarWrapper isInActive={isSkipOptionDisabled}>
						{selectedAddressProof === CONST.EXTRACTION_KEY_AADHAAR && (
							<>
								{isSkipOptionDisabled ? (
									<UI.DisabledCheckbox />
								) : (
									<input
										id='skip-aadhaar'
										type='checkbox'
										checked={isAddharSkipChecked}
										onChange={() =>
											setIsAddharSkipChecked(!isAddharSkipChecked)
										}
									/>
								)}
								<label htmlFor='skip-aadhaar'>
									I would like to skip aadhaar document upload and verify it
									later using OTP
								</label>
							</>
						)}
					</UI.SkipAadhaarWrapper>
					<ButtonWrapper>
						{isWarning ? (
							<Button
								onClick={() => {
									proceedToNextSection();
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
								disabled={isProceedDisabledAddressProof}
								onClick={() => {
									if (isAddharSkipChecked && !isSkipOptionDisabled)
										return proceedToNextSection();
									handleExtractionAddressProof();
								}}
							/>
						)}
					</ButtonWrapper>
				</section>
			)}
			{screen === CONST.SCREEN_GST_UDHYOG && (
				<form onSubmit={handleSubmit(onProceedGstUdhyog)}>
					<FieldWrapper>
						{register({
							name: 'panNumber',
							placeholder: 'Pan Number',
							value:
								formState?.values?.panNumber || sessionStorage.getItem('pan'),
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
								borderColor: formState?.values?.gstin && gstError && 'red',
							},
						})}
					</FieldWrapper>
					{formState?.values?.gstin && gstError && (
						<FieldWrapper>
							<LabRed>{gstError}</LabRed>
						</FieldWrapper>
					)}
					<H2>OR</H2>
					<FieldWrapper>
						{register({
							name: 'udhyogAadhar',
							placeholder: 'Udhyog Aadhar Number',
							value: formState?.values?.udhyogAadhar,
							style: {
								borderColor:
									formState?.values?.udhyogAadhar && udhyogError && 'red',
							},
							mask: { CharacterLimit: 12 },
						})}
					</FieldWrapper>
					{formState?.values?.udhyogAadhar && udhyogError && (
						<FieldWrapper>
							<LabRed>{udhyogError}</LabRed>
						</FieldWrapper>
					)}
					<ButtonWrapper>
						<Button
							isLoader={loading}
							name={loading ? 'Please wait...' : 'Proceed'}
							fill
							disabled={isProceedDIsabledGstUdhyog}
						/>
					</ButtonWrapper>
				</form>
			)}
		</Wrapper>
	);
}
