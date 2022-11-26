import React, { useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
// import Modal from 'components/Modal';
import CheckBox from 'shared/components/Checkbox/CheckBox';
import AuthenticationOtpModal from './AuthenticationOTPModal';
import BankStatementModal from 'components/BankStatementModal';
import Loading from 'components/Loading';
// import CategoryFileUpload from './CategoryFileUpload';
// import CategoryFileUpload from 'shared/components/FileUpload/FileUpload';
import CategoryFileUpload from './CategoryFileUpload';
import Textarea from 'components/inputs/Textarea';

import {
	DOCS_UPLOAD_URL,
	BUSSINESS_LOAN_CASE_CREATION,
	NC_STATUS_CODE,
	ADD_SUBSIDIARY_DETAILS,
	ADD_BANK_DETAILS,
	ADD_SHAREHOLDER_DETAILS,
	ADD_REFENCE_DETAILS,
	DOCTYPES_FETCH,
	WHITELABEL_ENCRYPTION_API,
	CIN_UPDATE,
	BUSSINESS_LOAN_CASE_CREATION_EDIT,
	UPLOAD_CACHE_DOCS,
	AUTHENTICATION_GENERATE_OTP,
	CO_APPLICANTS_DOCTYPES_FETCH,
	HOSTNAME,
	APP_DOCTYPE_LIST_REQ_BODY,
	APP_DOCTYPE_LIST_RESPONSE,
	CO_APP_CREATE_RESPONSE,
	CO_APP_DOCTYPE_LIST_REQ_BODY,
	CO_APP_DOCTYPE_LIST_RESPONSE,
	FETCH_EVAL_DETAILS,
	BORROWER_UPLOAD_URL,
} from '_config/app.config';
import {
	addLoanDocuments,
	removeLoanDocument,
	updateSelectedDocumentTypeId,
} from 'store/applicantCoApplicantsSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import { setSelectedSectionId } from 'store/appSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import { asyncForEach } from 'utils/helper';
import { formatSectionReqBody } from 'utils/formatData';
import iconDownArray from 'assets/icons/down_arrow_grey_icon.png';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as UI from './ui';
import * as CONST from './const';

const DocumentUpload = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const dispatch = useDispatch();
	const {
		selectedProduct,
		isViewLoan,
		isEditLoan,
		editLoanData,
		userDetails,
		isCorporate,
		nextSectionId,
		selectedSectionId,
	} = app;
	const {
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const { businessId, businessUserId, loanId } = application;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId] || {};
	const { directorId } = selectedApplicant;
	const selectedApplicantIncomeTypeId =
		selectedApplicant?.basic_details?.income_type;
	const { documents: uploadedDocuments = [] } = selectedApplicant;
	const [prefilledDocs, setPrefilledDocs] = useState([]);
	const [allDocumentTypeList, setAllDocumentTypeList] = useState([]);
	const [allTagUnTagDocList, setAllTagUnTagDocList] = useState([]);
	const [openSection, setOpenSection] = useState([
		CONST_SECTIONS.DOC_CATEGORY_KYC,
	]);
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(true);
	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	const [declareCheck, setDeclareCheck] = useState(false);
	const [
		isOtherBankStatementModalOpen,
		setIsOtherBankStatementModal,
	] = useState(false);
	const [
		isAuthenticationOtpModalOpen,
		setIsAuthenticationOtpModalOpen,
	] = useState(false);
	const [generateOtpTimer, setGenerateOtpTimer] = useState(0);

	const initializeExternalUserDocCheckList = async () => {
		try {
			const evalData = await axios.get(
				`${FETCH_EVAL_DETAILS}?loanId=${editLoanData?.id}`
			);
			const selectedEvalData = evalData?.data?.data?.filter(
				d => d.assign_userid === userDetails.id
			)[0];
			const newSelectedDocCheckList = selectedEvalData
				? selectedEvalData?.assigned_document_list
					? JSON.parse(selectedEvalData?.assigned_document_list)
					: []
				: [];
			// setSelectedDocCheckList(newSelectedDocCheckList);
			// console.log('initializeExternalUserDocCheckList-evalData-', {
			// 	evalData,
			// 	selectedEvalData,
			// });
			return newSelectedDocCheckList;
		} catch (error) {
			console.error('error-initializeExternalUserDocCheckList-', error);
		}
	};

	const getApplicantDocumentTypes = async () => {
		try {
			const reqBody = {
				business_type: selectedApplicantIncomeTypeId,
				loan_product: selectedProduct.product_id[selectedApplicantIncomeTypeId],
			};
			// console.log('applicantDocReqBody-', { reqBody });
			const applicantDocRes = await axios.post(DOCTYPES_FETCH, reqBody);
			// console.log('applicantDocRes-', applicantDocRes);
			const newAppDocOptions = [];
			for (const key in applicantDocRes?.data) {
				applicantDocRes?.data[key].map(d => {
					let category = '';
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_KYC)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_KYC;
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_FINANCIAL)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_FINANCIAL;
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_OTHER)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_OTHER;
					newAppDocOptions.push({
						...d,
						value: d.doc_type_id,
						name: d.name,
						// doc_type_id: `app_${selectedApplicantIncomeTypeId}_${category}_${
						// 	d.doc_type_id
						// }`,
						doc_type_id: d.doc_type_id,
						category,
					});
					return null;
				});
			}
			return newAppDocOptions;
		} catch (error) {
			console.error('error-getApplicantDocumentTypes-', error);
			return [];
		}
	};

	const getCoApplicantDocumentTypes = async coApplicant => {
		try {
			// http://3.108.54.252:1337/coApplicantDocList?income_type=1
			const coApplicantIncomeTypeId = coApplicant?.basic_details?.income_type;
			let coAppDocTypesRes = await axios.get(
				`${CO_APPLICANTS_DOCTYPES_FETCH}?income_type=${coApplicantIncomeTypeId}`
			);
			coAppDocTypesRes = coAppDocTypesRes?.data?.data || [];
			// console.log('coAppDocTypesRes-', coAppDocTypesRes);
			// coApplicant
			// const newIncomeTypeDocTypeList = {};
			const newDocTypeList = [];
			for (const key in coAppDocTypesRes) {
				// console.log('coAppDocTypesRes?.data?.data-', { key });
				// newIncomeTypeDocTypeList[key] = [];
				coAppDocTypesRes[key]?.map(d => {
					let category = '';
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_KYC)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_KYC;
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_FINANCIAL)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_FINANCIAL;
					if (
						d?.doc_type
							?.toLowerCase()
							?.includes(CONST_SECTIONS.DOC_CATEGORY_OTHER)
					)
						category = CONST_SECTIONS.DOC_CATEGORY_OTHER;
					const newDoc = {
						...d,
						// doc_type_id: `co_${coApplicant?.id}_${
						// 	coApplicant?.income_type
						// }_${category}_${d?.id}`,
						doc_type_id: d?.id,
						director_id: coApplicant?.id,
						type_name: coApplicant?.type_name,
						value: d?.id,
						main: category,
						mainType: category,
						category,
					};
					newDocTypeList.push(newDoc);
					// newIncomeTypeDocTypeList[key].push(newDoc);
					return null;
				});
			}
			return newDocTypeList;
			// return { newIncomeTypeDocTypeList, newDocTypeList };
		} catch (error) {
			console.error('error-getCoApplicantDocumentTypes-', error);
			return [];
		}
	};

	const initializeDocTypeList = async () => {
		try {
			// console.log('initializeDocTypeList');
			setLoading(true);
			// TODO: viewloan external evaluation
			// let externalUserSelectedDocTypeList = [];
			// if (isViewLoan) {
			// 	externalUserSelectedDocTypeList = await initializeExternalUserDocCheckList();
			// }
			// get applicant document list
			const newAppDocOptions = isApplicant
				? await getApplicantDocumentTypes()
				: await getCoApplicantDocumentTypes(selectedApplicant);
			// console.log('newAppDocOptions-before-sort-', { newAppDocOptions });
			setAllDocumentTypeList(newAppDocOptions.sort((a, b) => a.id - b.id));
			// console.log('newAppDocOptions-', { newAppDocOptions });
		} catch (error) {
			console.error('error-initializeComponent-', error);
		} finally {
			setLoading(false);
		}
	};

	const initializeTaggUnTagDocuments = () => {
		// prefill document tagged and un-tagged
		// console.log('initializeTaggUnTagDocuments');

		const flowDocTypeMappingList = {};

		// TODO: Fetch this from getLoanDetails with loan ref id and tag
		// const JSON_PAN_SECTION = flowMap?.['pan-verification']?.fields || [];
		// for (const key in JSON_PAN_SECTION) {
		// 	JSON_PAN_SECTION[key]?.data?.map(d => {
		// 		if (d.req_type && d.doc_type[`${selectedApplicantIncomeTypeId}`]) {
		// 			flowDocTypeMappingList[`${d.req_type}`] =
		// 				d.doc_type[`${selectedApplicantIncomeTypeId}`];
		// 		}
		// 		return null;
		// 	});
		// }

		// const JSON_HOMELOAN_SECTION = flowMap?.['home-loan-details']?.fields || [];
		// for (const key in JSON_HOMELOAN_SECTION) {
		// 	JSON_HOMELOAN_SECTION[key]?.data?.map(d => {
		// 		if (d.doc_type && d.doc_type[`${selectedApplicantIncomeTypeId}`]) {
		// 			flowDocTypeMappingList[`property`] =
		// 				d.doc_type[`${selectedApplicantIncomeTypeId}`];
		// 		}
		// 		return null;
		// 	});
		// }

		const newAllTagUnTagDocList = [];
		[...uploadedDocuments, ...prefilledDocs]?.map((doc, docIndex) => {
			let doc_type_id = doc.doc_type_id;
			// `app_${selectedApplicantIncomeTypeId}_${CATEGORY}_${editDoc?.doctype}`
			// if (!doc.typeId) {

			// this solution is not solid for tagging preuploaded document in docupload page
			// work on this when new requirement comes
			let isKYCDocs = false;
			if (doc.requestId || doc.req_type === 'property') {
				doc_type_id = `app_${selectedApplicantIncomeTypeId}_${doc.category}_${
					flowDocTypeMappingList?.[`${doc?.req_type}`]
				}`;
				isKYCDocs = true;
			}
			const newDoc = {
				..._.cloneDeep(doc),
				name: doc.upload_doc_name || doc.name,
				progress: '100',
				status: 'completed',
				file: null,
				typeId: doc.typeId || flowDocTypeMappingList[`${doc.req_type}`] || '',
				doc_type_id,
			};
			if (doc.isViewEdit) {
				newDoc.typeId = doc.doctype;
			}
			if (isKYCDocs) {
				newDoc.isMandatory = true;
			}
			// newDoc.doc_type_id = 'app_7_kyc_31';
			// if (newDoc.typeId) state.documents[docIndex].typeId = newDoc.typeId;
			newAllTagUnTagDocList.push(newDoc);
			return null;
		});
		// -- prefill document tagged and un-tagged

		// console.log('initializeComponent-allstates-', {
		// 	uploadedDocuments,
		// 	flowDocTypeMappingList,
		// 	newAllTagUnTagDocList,
		// 	allDocumentTypeList,
		// });

		setAllTagUnTagDocList(newAllTagUnTagDocList);
	};

	useEffect(() => {
		initializeDocTypeList();
		initializeTaggUnTagDocuments();
		// eslint-disable-next-line
	}, [selectedApplicantCoApplicantId]);

	useEffect(() => {
		initializeTaggUnTagDocuments();
		// eslint-disable-next-line
	}, [uploadedDocuments, prefilledDocs]);

	const buttonDisabledStatus = () => {
		return !(cibilCheckbox && declareCheck);
	};

	const onProceedOtpAuthentication = async () => {
		try {
			if (buttonDisabledStatus()) return;
			if (!isFormValid()) return;
			setLoading(true);
			const authenticationOtpReqBody = {
				mobile: selectedApplicant?.basic_details?.mobileNo,
				business_id: businessId,
				product_id: selectedProduct.id,
			};
			await axios.post(AUTHENTICATION_GENERATE_OTP, authenticationOtpReqBody);
			setIsAuthenticationOtpModalOpen(true);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			if (error?.response?.data?.timer) {
				setIsAuthenticationOtpModalOpen(true);
				setGenerateOtpTimer(error?.response?.data?.timer || 0);
			}
			console.error(error);
			addToast({
				message:
					error?.response?.data?.message || 'Server down, try after sometimes',
				type: 'error',
			});
		}
	};

	const isFormValid = () => {
		let isDocTypeUnTagged = false;
		uploadedDocuments?.map(ele => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (ele.req_type) return null;
			if (!ele.typeId) {
				isDocTypeUnTagged = true;
				return false;
			}
			return null;
		});

		if (isDocTypeUnTagged) {
			addToast({
				message: 'Please select the document type',
				type: 'error',
			});
			return false;
		}
		// const allDocOptions = [
		// 	...KycDocOptions,
		// 	...FinancialDocOptions,
		// 	...OtherDocOptions,
		// ];
		let manadatoryError = false;
		const allMandatoryDocumentIds = [];
		// documentTypes.map(
		// 	d => d.isMandatory && allMandatoryDocumentIds.push(d.doc_type_id)
		// );
		const uploadedDocumetnIds = [];
		// [...uploadedDocuments, ...prefilledDocs]?.map(d =>
		[...allTagUnTagDocList, ...prefilledDocs]?.map(d =>
			uploadedDocumetnIds.push(d.doc_type_id)
		);

		if (selectedProduct.document_mandatory) {
			allMandatoryDocumentIds.map(docId => {
				if (!uploadedDocumetnIds.includes(docId)) {
					manadatoryError = true;
					// console.log('doc-pending-for-upload-', {
					// 	docId,
					// 	allMandatoryDocumentIds,
					// 	uploadedDocuments,
					// 	prefilledDocs,
					// });
					return null;
				}
				return null;
			});
		}
		// console.log('LoanDocumentsUpload-isFormValid-', {
		// 	allMandatoryDocumentIds,
		// 	uploadedDocumetnIds,
		// 	manadatoryError,
		// });
		if (manadatoryError) {
			addToast({
				message:
					'Please upload all the required documents to submit the application',
				type: 'error',
			});
			return false;
		}
		return true;
	};

	const onProceedCompleteApplication = async () => {
		if (buttonDisabledStatus()) return;
		if (!isFormValid()) return;
		try {
			setLoading(true);
			const documentUploadReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
			});
			const newUploadedDocuments = [];
			allTagUnTagDocList.map(doc => {
				newUploadedDocuments.push({
					...doc,
					loan_id: loanId,
				});
				return null;
			});
			documentUploadReqBody.data.document_upload = newUploadedDocuments;
			// console.log('documentUploadReqBody-', documentUploadReqBody);
			await axios.post(`${BORROWER_UPLOAD_URL}`, documentUploadReqBody);
			dispatch(
				updateApplicationSection({
					sectionId: selectedSectionId,
					sectionValues: { isSkip: true },
				})
			);
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-onProceedCompleteApplication-', error);
			// TODO: shreyas alert approprepate error from api
		} finally {
			// TODO: move this logic to try balock
			setLoading(false);
		}
		// /borrowerdoc-upload
		if (editLoanData && editLoanData?.loan_ref_id) {
			setTimeout(() => {
				addToast({
					message: 'Your application has been updated',
					type: 'success',
				});
			}, 1000);
		}
		// TODO: dispatch action for final submission
		setLoading(false);
	};

	// const onProceed = () => {
	// 	const coApplicantList = Object.keys(coApplicants);
	// 	if (coApplicantList.length > 0) {
	// 		const currentCoApplicantIndex = coApplicantList.findIndex(
	// 			directorId => directorId === selectedApplicantCoApplicantId
	// 		);
	// 		const nextCoApplicantIndex = currentCoApplicantIndex + 1;
	// 		console.log('co-app-index-', {
	// 			coApplicantList,
	// 			currentCoApplicantIndex,
	// 			nextCoApplicantIndex,
	// 			nextSectionId,
	// 		});
	// 		if (nextCoApplicantIndex < coApplicantList.length) {
	// 			dispatch(
	// 				setSelectedApplicantCoApplicantId(
	// 					coApplicantList[nextCoApplicantIndex]
	// 				)
	// 			);
	// 		} else {
	// 			dispatch(setSelectedSectionId(nextSectionId));
	// 		}
	// 	} else {
	// 		// TODO: move to next section
	// 		// dispatch(setSelectedSectionId(nextSectionId));
	// 	}
	// };

	const toggleOpenSection = sectionId => {
		// console.log('toggleOpenSection-', sectionId);
		if (openSection.includes(sectionId)) {
			setOpenSection(openSection.filter(s => s !== sectionId));
			return;
		}
		setOpenSection([...openSection, sectionId]);
	};

	const handleFileUpload = async (files, meta = {}) => {
		const newFiles = [];
		files.map(f => newFiles.push({ ...f, ...meta }));
		dispatch(addLoanDocuments(newFiles));
	};

	const handleFileRemove = async fileId => {
		// console.log('handleFileRemove-', {
		// 	fileId,
		// });
		dispatch(removeLoanDocument(fileId));
		// TODO: shreyash edit mode remove file from session storage
		// if (isEditLoan) {
		// 	removeFileFromSessionStorage(file);
		// }
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		// console.log('handleDocumentTypeChange-', { fileId, type });
		dispatch(updateSelectedDocumentTypeId({ fileId, docType: type }));
	};

	const renderDocUploadedCount = data => {
		const { uploaded, total } = data;
		if (!displayUploadedDocCount) return null;
		return (
			<div
				style={{
					marginLeft: 10,
					alignItems: 'center',
					display: 'flex',
				}}
			>
				Document Submitted :
				<UI.StyledButton width={'auto'} fillColor>
					{uploaded}
					{total ? ` of ${total}` : ''}
				</UI.StyledButton>
			</div>
		);
	};

	let displayProceedButton = null;
	if (selectedProduct.otp_authentication && !isEditLoan) {
		displayProceedButton = (
			<Button
				name='Submit'
				fill
				style={{
					width: '200px',
					background: 'blue',
				}}
				isLoader={loading}
				disabled={loading || buttonDisabledStatus()}
				onClick={!loading && onProceedOtpAuthentication}
			/>
		);
	} else {
		displayProceedButton = (
			<Button
				name='Submit'
				fill
				style={{
					width: '200px',
					background: 'blue',
				}}
				isLoader={loading}
				disabled={loading || buttonDisabledStatus()}
				onClick={!loading && onProceedCompleteApplication}
			/>
		);
	}

	const totalMandatoryDocumentCount = allDocumentTypeList.filter(
		d => !!d.isMandatory
	)?.length;

	const mendatoryDocIdTracker = [];
	[...allTagUnTagDocList, ...prefilledDocs]?.map(d => {
		if (mendatoryDocIdTracker.includes(d.doc_type_id)) return null;
		if (!!d.isMandatory) {
			mendatoryDocIdTracker.push(d.doc_type_id);
		}
		return null;
	});
	const totalMandatoryUploadedDocumentCount = mendatoryDocIdTracker.length;

	let displayUploadedDocCount = true;
	if (userDetails?.is_other === 1 && isViewLoan) {
		displayUploadedDocCount = false;
	}

	// console.log('DocumentUpload-allStates-', {
	// 	app,
	// 	application,
	// 	applicantCoApplicants,
	// 	displayProceedButton,
	// 	displayUploadedDocCount,
	// 	selectedApplicant,
	// 	selectedApplicantIncomeTypeId,
	// });

	if (loading) {
		return (
			<UI.LoaderWrapper>
				<Loading />
			</UI.LoaderWrapper>
		);
	}

	return (
		<UI.Wrapper>
			{isAuthenticationOtpModalOpen ? (
				<AuthenticationOtpModal
					isAuthenticationOtpModalOpen={isAuthenticationOtpModalOpen}
					setIsAuthenticationOtpModalOpen={setIsAuthenticationOtpModalOpen}
					setContactNo={selectedApplicant?.basic_details?.mobileNo}
					onSubmitCompleteApplication={onProceedCompleteApplication}
					generateOtpTimer={generateOtpTimer}
				/>
			) : null}
			{totalMandatoryDocumentCount > 0 ? (
				<UI.CollapseBody
					style={{ marginBottom: 20, borderBottom: '3px solid #eee' }}
				>
					<UI.CategoryNameHeader>
						<span style={{ color: 'red' }}>*</span> Mandatory
					</UI.CategoryNameHeader>
					{renderDocUploadedCount({
						uploaded: totalMandatoryUploadedDocumentCount,
						total: totalMandatoryDocumentCount,
					})}
				</UI.CollapseBody>
			) : null}
			{/* <UI.NameHeaderWrapper>
				<span>Applicant Document Upload</span>
				<UI.ApplicantCoApplicantName>
					{`${selectedApplicant?.basic_details?.first_name} ${
						selectedApplicant?.basic_details?.last_name
					}`}
				</UI.ApplicantCoApplicantName>
			</UI.NameHeaderWrapper> */}
			{CONST_SECTIONS.ALL_DOC_CATEGORY.map((category, categoryIndex) => {
				const selectedDocumentTypeList =
					allDocumentTypeList?.filter(doc => doc.category === category) || [];
				if (selectedDocumentTypeList.length <= 0) return null;

				// console.log('selectedDocumentTypeList-', {
				// 	category,
				// 	selectedDocumentTypeList,
				// });

				const prefilledDocsTag = [];
				const prefilledDocUnTag = [];
				allTagUnTagDocList.map(doc => {
					if (doc?.category === category && !!doc.typeId) {
						return prefilledDocsTag.push(doc);
					} else if (doc?.category === category && !doc.typeId) {
						return prefilledDocUnTag.push(doc);
					}
					return null;
				});
				return (
					<div key={`data-${category}-{${directorId}}`}>
						<UI.CollapseHeader onClick={() => toggleOpenSection(category)}>
							<UI.CategoryNameHeader>
								{category.toLocaleUpperCase()}{' '}
							</UI.CategoryNameHeader>
							{renderDocUploadedCount({
								uploaded: prefilledDocs.length,
								total: selectedDocumentTypeList.length,
							})}
							<UI.CollapseIcon
								src={iconDownArray}
								style={{
									transform: openSection.includes(category)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.CollapseHeader>
						<UI.CollapseBody open={openSection.includes(category)}>
							<UI.UploadWrapper open={openSection.includes(category)}>
								<CategoryFileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={prefilledDocsTag}
									startingUnTaggedDocs={prefilledDocUnTag}
									sectionType={category}
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											directorId: directorId,
											category,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={selectedDocumentTypeList}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId: businessUserId,
										}),
									}}
								/>
							</UI.UploadWrapper>
						</UI.CollapseBody>
					</div>
				);
			})}
			<UI.Footer>
				{/* TODO: comment for office use  */}
				{/* <UI.Divider />
				<UI.CategoryNameHeader>Comments for Office Use</UI.CategoryNameHeader>
				<Textarea {...CONST.commentsForOfficeUseField} />
				<UI.Divider /> */}
				{!isViewLoan && (
					<Button
						name='Get Other Bank Statements'
						onClick={isOtherBankStatementModalOpen}
						customStyle={{ width: 'auto', height: '45px' }}
					/>
				)}
				<UI.CheckboxWrapper>
					<CheckBox
						name={
							isCorporate ? (
								<span>
									{CONST.textForCheckbox.grantCibilAcces.replace(
										'CIBIL',
										'Bureau'
									)}
								</span>
							) : (
								<span>{CONST.textForCheckbox.grantCibilAcces}</span>
							)
						}
						checked={cibilCheckbox}
						disabled={cibilCheckbox || isViewLoan}
						onChange={() => {
							setCibilCheckbox(!cibilCheckbox);
							//setCibilCheckModal(true);
						}}
						bg='blue'
					/>
					<CheckBox
						name={
							selectedProduct?.termsandconditionsurl ? (
								<>
									<span>{CONST.textForCheckbox.declaration}</span>
									<span>{CONST.getATag(selectedProduct)}</span>
									<span>{CONST.textForCheckbox.declaration2}</span>
								</>
							) : (
								<span>{CONST.textForCheckbox.defaultDeclaration}</span>
							)
						}
						checked={declareCheck}
						disabled={isViewLoan}
						onChange={() => setDeclareCheck(!declareCheck)}
						bg='blue'
					/>
				</UI.CheckboxWrapper>
				<UI.SubmitWrapper>{displayProceedButton}</UI.SubmitWrapper>
				{isOtherBankStatementModalOpen && (
					<BankStatementModal
						showModal={isOtherBankStatementModalOpen}
						onClose={() =>
							setIsOtherBankStatementModal(!isOtherBankStatementModalOpen)
						}
					/>
				)}
			</UI.Footer>
		</UI.Wrapper>
	);
};

export default DocumentUpload;
