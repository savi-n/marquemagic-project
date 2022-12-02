import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import CheckBox from 'shared/components/Checkbox/CheckBox';
import AuthenticationOtpModal from './AuthenticationOTPModal';
import BankStatementModal from 'components/BankStatementModal';
import Loading from 'components/Loading';
import CategoryFileUpload from './CategoryFileUpload';
import Textarea from 'components/inputs/Textarea';

import * as API from '_config/app.config';
import {
	updateApplicationSection,
	addAllDocumentTypes,
	setCommentsForOfficeUse,
	addOrUpdateCacheDocuments,
} from 'store/applicationSlice';
import { setSelectedSectionId } from 'store/appSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import { asyncForEach } from 'utils/helper';
import {
	formatSectionReqBody,
	getDocumentCategoryName,
} from 'utils/formatData';
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
		isEditOrViewLoan,
	} = app;
	const {
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const {
		loanId,
		businessId,
		loanProductId,
		allDocumentTypes,
		cacheDocuments,
		commentsForOfficeUse,
	} = application;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId] || {};
	const { directorId } = selectedApplicant;
	let selectedApplicantIncomeTypeId =
		selectedApplicant?.basic_details?.income_type ||
		selectedApplicant?.income_type;
	const selectedApplicantDocumentTypes = allDocumentTypes?.filter(
		docType => `${docType.directorId}` === `${directorId}`
	);
	const selectedApplicantDocuments = cacheDocuments.filter(
		doc => `${doc.directorId}` === `${directorId}`
	);
	const [, setIsVerifyWithOtpDisabled] = useState(false);
	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;
	// TODO: visibility of documents
	// selectedApplicant?.cacheDocuments.map(doc =>
	// 	selectedApplicantDocuments.push(doc)
	// );
	const [openSection, setOpenSection] = useState([
		CONST_SECTIONS.DOC_CATEGORY_KYC,
	]);
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [savingComments, setSavingComments] = useState(false);
	const [submitting, setSubmitting] = useState(false);
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

	// EVAL DOCUMENTS
	// const initializeExternalUserDocCheckList = async () => {
	// 	try {
	// 		const evalData = await axios.get(
	// 			`${API.FETCH_EVAL_DETAILS}?loanId=${editLoanData?.id}`
	// 		);
	// 		const selectedEvalData = evalData?.data?.data?.filter(
	// 			d => d.assign_userid === userDetails.id
	// 		)[0];
	// 		const newSelectedDocCheckList = selectedEvalData
	// 			? selectedEvalData?.assigned_document_list
	// 				? JSON.parse(selectedEvalData?.assigned_document_list)
	// 				: []
	// 			: [];
	// 		// setSelectedDocCheckList(newSelectedDocCheckList);
	// 		// console.log('initializeExternalUserDocCheckList-evalData-', {
	// 		// 	evalData,
	// 		// 	selectedEvalData,
	// 		// });
	// 		return newSelectedDocCheckList;
	// 	} catch (error) {
	// 		console.error('error-initializeExternalUserDocCheckList-', error);
	// 	}
	// };

	const getApplicantDocumentTypes = async () => {
		try {
			const reqBody = {
				business_type: selectedApplicantIncomeTypeId,
				loan_product: loanProductId,
			};
			// console.log('applicantDocReqBody-', { reqBody });
			const applicantDocRes = await axios.post(API.DOCTYPES_FETCH, reqBody);
			// console.log('applicantDocRes-', applicantDocRes);

			const newAppDocOptions = [];
			for (const key in applicantDocRes?.data) {
				applicantDocRes?.data[key].map(d => {
					const category = getDocumentCategoryName(d?.doc_type);
					newAppDocOptions.push({
						...d,
						value: d.doc_type_id,
						name: d.name,
						doc_type_id: d.doc_type_id,
						category,
						directorId: applicant.directorId,
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
			const coApplicantIncomeTypeId =
				coApplicant?.basic_details?.income_type || coApplicant?.income_type;
			let coAppDocTypesRes = await axios.get(
				`${
					API.CO_APPLICANTS_DOCTYPES_FETCH
				}?income_type=${coApplicantIncomeTypeId}`
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
					const category = getDocumentCategoryName(d?.doc_type);
					const newDoc = {
						...d,
						doc_type_id: d?.id,
						type_name: coApplicant?.type_name,
						value: d?.id,
						category,
						directorId: coApplicant?.directorId,
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

			const newAllDocumentTypes = [];

			// EXTERNAL / OTHER USER
			// TODO: shreyas viewloan external evaluation
			// let externalUserSelectedDocTypeList = [];
			// if (isViewLoan) {
			// 	externalUserSelectedDocTypeList = await initializeExternalUserDocCheckList();
			// }
			// get applicant document list
			// -- EXTERNAL / OTHER USER

			// APPLICANT
			const oldApplicantDocumentTypes = allDocumentTypes?.filter(
				docType => `${docType.directorId}` === `${applicant.directorId}`
			);

			if (oldApplicantDocumentTypes?.length > 0) {
				oldApplicantDocumentTypes.map(docType =>
					newAllDocumentTypes.push({ ...docType })
				);
			} else {
				const newApplicantDocumentTypes = await getApplicantDocumentTypes();
				newApplicantDocumentTypes.map(docType =>
					newAllDocumentTypes.push({ ...docType })
				);
			}
			// -- APPLICANT

			// CO-APPLICANTS
			await asyncForEach(Object.keys(coApplicants), async directorId => {
				const oldCoApplicantDocumentTypes = allDocumentTypes?.filter(
					docType => `${docType.directorId}` === `${directorId}`
				);
				if (oldCoApplicantDocumentTypes?.length > 0) {
					oldCoApplicantDocumentTypes.map(docType =>
						newAllDocumentTypes.push({ ...docType })
					);
				} else {
					const newCoApplicantDocumentTypes = await getCoApplicantDocumentTypes(
						coApplicants[directorId]
					);
					newCoApplicantDocumentTypes.map(docType =>
						newAllDocumentTypes.push({ ...docType })
					);
				}
			});
			// -- CO-APPLICANTS

			newAllDocumentTypes.sort((a, b) => a.id - b.id);
			dispatch(addAllDocumentTypes(newAllDocumentTypes));

			if (isEditOrViewLoan) {
				const newDoc = [];
				cacheDocuments?.map(doc => {
					const selectedDocType =
						newAllDocumentTypes.filter(docType => {
							if (`${docType.doc_type_id}` === `${doc.doctype}`) return true;
							return false;
						})?.[0] || {};
					newDoc.push({
						...selectedDocType,
						...doc,
					});
					return null;
				});
				// console.log('newDocs-', { newDoc });
				dispatch(addOrUpdateCacheDocuments({ files: newDoc }));
			}

			// console.log('allDocumentTypes-', newAllDocumentTypes);
			// console.log('newAppDocOptions-before-sort-', { newAppDocOptions });
			// setAllDocumentTypeList(newAppDocOptions.sort((a, b) => a.id - b.id));
			// console.log('newAppDocOptions-', { newAppDocOptions });
		} catch (error) {
			console.error('error-initializeComponent-', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeDocTypeList();
		// eslint-disable-next-line
	}, []);

	const buttonDisabledStatus = () => {
		return !(cibilCheckbox && declareCheck);
	};

	const onSubmitOtpAuthentication = async () => {
		try {
			if (buttonDisabledStatus()) return;
			if (!isFormValid()) return;
			setLoading(true);
			const authenticationOtpReqBody = {
				mobile: +selectedApplicant?.basic_details?.mobile_no,
				business_id: businessId,
				product_id: selectedProduct.id,
			};
			// let authenticateOtp =
			await axios.post(
				API.AUTHENTICATION_GENERATE_OTP,
				authenticationOtpReqBody
			);
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
		cacheDocuments?.map(doc => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (doc?.req_type) return null;
			if (!doc?.doc_type_id) {
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
		let manadatoryError = false;
		const allMandatoryDocumentIds = [];
		allDocumentTypes.map(
			d =>
				d?.isMandatory &&
				allMandatoryDocumentIds.push(`${d?.directorId}${d?.doc_type_id}`)
		);
		const uploadedDocumetnIds = [];
		// [...uploadedDocuments, ...prefilledDocs]?.map(d =>
		cacheDocuments?.map(d =>
			uploadedDocumetnIds.push(`${d?.directorId}${d?.doc_type_id}`)
		);

		if (isDocumentUploadMandatory) {
			allMandatoryDocumentIds.map(docId => {
				if (!uploadedDocumetnIds.includes(docId)) {
					manadatoryError = true;
					return null;
				}
				return null;
			});
		}
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
	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const onSubmitCompleteApplication = async () => {
		if (buttonDisabledStatus()) return;
		if (!isFormValid()) return;
		try {
			setSubmitting(true);
			const documentUploadReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
			});
			const newUploadedDocuments = [];
			cacheDocuments?.map(doc => {
				if (doc?.document_id) return null;
				newUploadedDocuments.push({
					...doc,
					file: null,
					preview: null,
					id: doc.doc_type_id,
					loan_id: loanId,
				});
				return null;
			});
			documentUploadReqBody.data.document_upload = newUploadedDocuments;
			if (isDocumentUploadMandatory) {
				documentUploadReqBody.is_mandatory_documents_uploaded = true;
			}
			// console.log('onSubmitCompleteApplication-documentUploadReqBody', {
			// 	documentUploadReqBody,
			// });
			// return;
			// const documentUploadRes =
			if (
				documentUploadReqBody.is_mandatory_documents_uploaded ||
				documentUploadReqBody.data.document_upload.length > 0
			) {
				await axios.post(`${API.BORROWER_UPLOAD_URL}`, documentUploadReqBody);
			}
			// console.log('onSubmitCompleteApplication-documentUploadRes', {
			// 	documentUploadRes,
			// });
			onSkip();
		} catch (error) {
			console.error('error-onSubmitCompleteApplication-', error);
			// TODO: shreyas alert approprepate error from api
		} finally {
			// TODO: move this logic to try balock
			setSubmitting(false);
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

	const onBlurCommentsForOfficeUse = async () => {
		try {
			setSavingComments(true);
			const commentReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: {},
			});
			commentReqBody.comments_for_office_use = commentsForOfficeUse;
			await axios.post(`${API.ADD_COMMENTS_FOR_OFFICE_USE}`, commentReqBody);
		} catch (error) {
			console.error('error-onBlurCommentsForOfficeUse-', error);
		} finally {
			setSavingComments(false);
		}
	};

	const toggleOpenSection = sectionId => {
		// console.log('toggleOpenSection-', sectionId);
		if (openSection.includes(sectionId)) {
			setOpenSection(openSection.filter(s => s !== sectionId));
			return;
		}
		setOpenSection([...openSection, sectionId]);
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
	if (selectedProduct.product_details.otp_authentication && !isEditLoan) {
		displayProceedButton = (
			<Button
				name='Submit'
				fill
				style={{
					width: '200px',
					background: 'blue',
				}}
				isLoader={submitting}
				disabled={submitting || buttonDisabledStatus()}
				onClick={() => {
					if (submitting) return;
					onSubmitOtpAuthentication();
				}}
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
				isLoader={submitting}
				disabled={submitting || buttonDisabledStatus()}
				onClick={() => {
					if (submitting) return;
					onSubmitCompleteApplication();
				}}
			/>
		);
	}

	const totalMandatoryDocumentCount = allDocumentTypes.filter(
		d => !!d.isMandatory
	)?.length;

	const mendatoryDocIdTracker = [];
	cacheDocuments?.map(d => {
		if (mendatoryDocIdTracker.includes(d?.doc_type_id)) return null;
		if (!!d.isMandatory) {
			mendatoryDocIdTracker.push(d?.doc_type_id);
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
	// 	directorId,
	// 	allDocumentTypes,
	// 	selectedApplicantDocumentTypes,
	// 	cacheDocuments,
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
					setContactNo={selectedApplicant?.basic_details?.mobile_no}
					onSubmitCompleteApplication={onSubmitCompleteApplication}
					setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
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
			{CONST_SECTIONS.ALL_DOC_CATEGORY.map((category, categoryIndex) => {
				const selectedDocumentTypes =
					selectedApplicantDocumentTypes?.filter(
						docType => docType.category === category
					) || [];
				if (selectedDocumentTypes.length <= 0) return null;
				const selectedDocuments = selectedApplicantDocuments?.filter(
					doc => doc?.category === category
				);

				// console.log('selectedDocumentTypes-', {
				// 	category,
				// 	selectedDocumentTypes,
				// });

				return (
					<div key={`data-${category}-{${directorId}}`}>
						<UI.CollapseHeader onClick={() => toggleOpenSection(category)}>
							<UI.CategoryNameHeader>
								{category.toLocaleUpperCase()}{' '}
							</UI.CategoryNameHeader>
							{renderDocUploadedCount({
								uploaded: selectedDocuments?.length,
								total: selectedDocumentTypes?.length,
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
									documents={selectedDocuments}
									documentTypes={selectedDocumentTypes}
									category={category}
									directorId={directorId}
								/>
							</UI.UploadWrapper>
						</UI.CollapseBody>
					</div>
				);
			})}
			<UI.Footer>
				{/* TODO: comment for office use  */}
				<UI.Divider />
				<UI.CategoryNameHeader>Comments for Office Use</UI.CategoryNameHeader>
				<Textarea
					{...CONST.commentsForOfficeUseField}
					value={commentsForOfficeUse}
					onChange={e => {
						dispatch(setCommentsForOfficeUse(e.target.value));
					}}
					loading={savingComments}
					disabled={savingComments}
					onBlur={onBlurCommentsForOfficeUse}
				/>
				<UI.Divider />
				{!isViewLoan && (
					<Button
						name='Get Other Bank Statements'
						onClick={() => setIsOtherBankStatementModal(true)}
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
							selectedProduct?.product_details?.termsandconditionsurl ? (
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
