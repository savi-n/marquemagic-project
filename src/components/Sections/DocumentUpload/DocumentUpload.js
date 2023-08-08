// Important Note :
// Evaluation Documents : Priority = 3
// Lender Documents : Priority = 300

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import Button from 'components/Button';
import CheckBox from 'shared/components/Checkbox/CheckBox';
import AuthenticationOtpModal from './AuthenticationOTPModal';
import BankStatementModal from 'components/BankStatementModal';
import Loading from 'components/Loading';
import CategoryFileUpload from './CategoryFileUpload';
import Textarea from 'components/inputs/Textarea';
import errorImage from 'assets/icons/geo-error.png';
import * as API from '_config/app.config';
import {
	setCompletedApplicationSection,
	addAllDocumentTypes,
	setCommentsForOfficeUse,
	setIsPrompted,
	addOrUpdateCacheDocumentsDocUploadPage,
	addSelfieCacheDocument,
	resetCacheDocuments,
} from 'store/applicationSlice';
import {
	setOnSiteSelfieGeoLocation,
	setGeotaggingMandatoryFields,
	// setDocumentSelfieGeoLocation,
	DIRECTOR_TYPES,
	removeOnSiteSelfieGeoLocation,
} from 'store/directorsSlice';
import { setSelectedSectionId } from 'store/appSlice';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatSectionReqBody,
	getDocumentCategoryName,
	// parseJSON,
	getApiErrorMessage,
	isDirectorApplicant,
	formatLoanDocuments,
	isFieldValid,
	getSelectedDirectorIndex,
	// getSelectedField,
} from 'utils/formatData';
import { scrollToTopRootElement } from 'utils/helper';
import iconDownArray from 'assets/icons/down_arrow_grey_icon.png';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as UI from './ui';
import * as CONST from './const';
import ProfileUpload from './ProfileUpload/ProfileUpload';
import AddressDetailsCard from '../../../components/AddressDetailsCard/AddressDetailsCard';
import useForm from 'hooks/useFormIndividual';
import CompleteOnsiteVerificationModal from 'components/modals/CompleteOnsiteVerificationModal';
import MandatoryOnsiteVerificationErrModal from 'components/modals/MandatoryOnsiteVerificationErrModal';
import { useLayoutEffect } from 'react';

const DocumentUpload = props => {
	const { app, application } = useSelector(state => state);
	const {
		directors,
		applicantDirectorId,
		selectedDirectorOptions,
	} = useSelector(state => state.directors);
	let { selectedDirectorId } = useSelector(state => state.directors);
	if (!selectedDirectorId)
		selectedDirectorId = CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY;
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const nonApplicantDirectorsObject = {};
	const nonApplicantDirectorsArray = [];
	Object.keys(directors).map(directorId => {
		if (directors[directorId].type_name === DIRECTOR_TYPES.applicant)
			return null;
		nonApplicantDirectorsObject[directorId] = directors?.[directorId] || {};
		nonApplicantDirectorsArray.push(directors[directorId]);
		return null;
	});
	const [entityGeolocation, setEntitiyGeoLocation] = useState(null);

	const [fetchedDirectors, setFetchedDirectors] = useState({});
	const dispatch = useDispatch();
	const { onChangeFormStateField } = useForm();
	const {
		selectedProduct,
		isViewLoan,
		isEditLoan,
		isEditOrViewLoan,
		isDraftLoan,
		// editLoanData,
		userDetails,
		isCorporate,
		nextSectionId,
		selectedSectionId,
		selectedSection,
		userToken,
		isGeoTaggingEnabled,
		permission,
	} = app;

	const {
		loanRefId,
		loanId,
		businessId,
		loanProductId,
		allDocumentTypes,
		cacheDocuments,
		commentsForOfficeUse,
		prompted,
		businessType,
		businessMobile,
		// isSelfieImagePresent,
	} = application;

	const selectedDirectorDocumentTypes = allDocumentTypes?.filter(
		docType => `${docType?.directorId}` === `${selectedDirectorId}`
	);

	// const newcacheDocuments=[...cacheDocuments].map(d=>(
	// 	if(!!d?.directorId){

	// 	}
	// ))

	const selectedDirectorDocuments = cacheDocuments.filter(
		doc => `${doc?.directorId}` === `${selectedDirectorId}`
	);

	const [, setIsVerifyWithOtpDisabled] = useState(false);
	const isDocumentUploadMandatory = !!selectedProduct?.product_details
		?.document_mandatory;
	const isCommentRequired = !!selectedSection?.sub_sections?.[0]?.fields?.filter(
		field => field.name === CONST.COMMENT_FOR_OFFICE_USE_FIELD_NAME
	)?.[0]?.rules?.required;
	// starts
	const selfieWithApplicantField = selectedSection?.sub_sections
		?.filter(item => item?.id === CONST.SELFIE_UPLOAD_SECTION_ID)?.[0]
		?.fields?.filter(
			field => field?.name === CONST.ON_SITE_SELFIE_UPLOAD_FIELD_NAME_APPLICANT
		)?.[0];

	const selfieWithCoapplicantField = selectedSection?.sub_sections
		?.filter(item => item?.id === CONST.SELFIE_UPLOAD_SECTION_ID)?.[0]
		?.fields?.filter(
			field =>
				field?.name === CONST.ON_SITE_SELFIE_UPLOAD_FIELD_NAME_COAPPLICANT
		)?.[0];

	const isSelfieWithApplicantOrEntityRequired =
		selfieWithApplicantField?.rules?.required;

	const isSelfieWithCoApplicantRequired =
		selfieWithCoapplicantField?.rules?.required;
	// console.log({
	// 	selfieWithApplicantField,
	// 	isSelfieWithApplicantOrEntityRequired,
	// });
	// ends
	const [cacheFile, setCacheFile] = useState({});
	const [onsiteVerificationMsg, setOnsiteVerificationMsg] = useState(false);

	// const selectedSelfieField = getSelectedField({
	// 	fieldName: CONST.ON_SITE_SELFIE_UPLOAD_FIELD_NAME_APPLICANT,
	// 	selectedSection,
	// 	isApplicant,
	// });

	// const [onsiteVerificationErr, setOnsiteVerificationErr] = useState(false);

	// const selectedIncomeType =
	// 	selectedDirector?.income_type === 0
	// 		? '0'
	// 		: selectedDirector?.income_type || '';

	const [openSection, setOpenSection] = useState([
		CONST_SECTIONS.DOC_CATEGORY_KYC,
	]);
	const applicantOrEntityMobileNumber =
		businessMobile ||
		directors?.[applicantDirectorId]?.dcontact ||
		selectedDirector?.dcontact ||
		'';

	const { addToast } = useToasts();
	const [submittingOtp, setSubmittingOtp] = useState(false);
	const [loading, setLoading] = useState(false);
	const [savingComments, setSavingComments] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	const [declareCheck, setDeclareCheck] = useState(false);
	const [commentsFromEditLOanData, setCommentsFromEditLoanData] = useState('');
	const [onSiteVerificationModal, setOnSiteVerificationModal] = useState(false);
	const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
	const [
		isOtherBankStatementModalOpen,
		setIsOtherBankStatementModal,
	] = useState(false);
	const [
		isAuthenticationOtpModalOpen,
		setIsAuthenticationOtpModalOpen,
	] = useState(false);
	const [generateOtpTimer, setGenerateOtpTimer] = useState(0);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	// const [geoLocationData, setGeoLocationData] = useState({});
	const isUseEffectCalledOnce = useRef(false);
	useEffect(() => {
		// console.log(allDocumentTypes, 'Alldoctypes');
		// console.log(cacheDocuments, ' cache docs');

		scrollToTopRootElement();
		if (!isUseEffectCalledOnce.current) {
			isUseEffectCalledOnce.current = true;
			let filteredSelfieDocs;
			const initializeDocTypeList = async () => {
				try {
					// console.log('initializeDocTypeList');
					setLoading(true);

					const newAllDocumentTypes = [];

					// EXTERNAL / OTHER USER
					const externalUserAllowedToViewDocTypeIds = [];
					if (isViewLoan) {
						// externalUserSelectedDocTypeList = await initializeExternalUserDocCheckList();
						try {
							const evalData = await axios.get(
								`${API.FETCH_EVAL_DETAILS}?loanId=${loanId}`
							);
							const selectedEvalData = evalData?.data?.data?.filter(
								d => `${d?.assign_userid}` === `${userDetails?.id}`
							)?.[0];
							const newSelectedDocCheckList = selectedEvalData
								? selectedEvalData?.assigned_document_list
									? JSON.parse(selectedEvalData?.assigned_document_list)
									: []
								: [];
							newSelectedDocCheckList.map(doc => {
								externalUserAllowedToViewDocTypeIds.push(
									`${doc?.director_id}${doc?.doc_type_id}`
								);
								return null;
							});
							// console.log('initializeExternalUserDocCheckList-evalData-', {
							// 	userDetails,
							// 	evalData,
							// 	selectedEvalData,
							// 	newSelectedDocCheckList,
							// 	editLoanData,
							// });
						} catch (error) {
							console.error('error-initializeExternalUserDocCheckList-', error);
						}
					}
					// -- EXTERNAL / OTHER USER

					// APPLICANT OR ENTITY
					try {
						const reqBody = {
							business_type:
								directors?.[applicantDirectorId]?.income_type || businessType,
							loan_product: loanProductId,
						};
						// console.log('applicantDocReqBody-', { reqBody });
						const applicantDocRes = await axios.post(
							API.DOCTYPES_FETCH,
							reqBody
						);
						// console.log('applicantDocRes-', applicantDocRes);
						for (const key in applicantDocRes?.data) {
							applicantDocRes?.data?.[key]?.forEach(d => {
								const category = getDocumentCategoryName(d?.doc_type);
								newAllDocumentTypes.push({
									...d,
									value: d.doc_type_id,
									name: d.name,
									doc_type_id: d.doc_type_id,
									category,
									directorId:
										applicantDirectorId || CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
								});
							});
						}
					} catch (error) {
						console.error(
							'error-failed-to-fetch-applicant-entity-documentlist-',
							error
						);
					}
					// -- APPLICANT OR ENTITY

					// NON-APPLICANTS
					// const coApplicantDocTypeResHistory = {};
					const allCoApplicantUniqueIncomeTypeIds = [];
					// console.log('coappdocfetch-', { nonApplicantDirectorsObject });
					Object.keys(nonApplicantDirectorsObject).forEach(directorId => {
						const businessOrIncomeType =
							nonApplicantDirectorsObject?.[directorId]?.income_type === 0
								? '0'
								: `${nonApplicantDirectorsObject?.[directorId]?.income_type ||
										''}` ||
								  `${nonApplicantDirectorsObject?.[directorId]?.businesstype ||
										''}` ||
								  '';
						if (
							!allCoApplicantUniqueIncomeTypeIds.includes(businessOrIncomeType)
						) {
							allCoApplicantUniqueIncomeTypeIds.push(businessOrIncomeType);
						}
					});
					// console.log('coappdocfetch-', {
					// 	allCoApplicantUniqueIncomeTypeIds,
					// 	nonApplicantDirectorsObject,
					// });
					if (allCoApplicantUniqueIncomeTypeIds.length > 0) {
						try {
							const coAppDocTypesRes = await axios.get(
								`${
									API.CO_APPLICANTS_DOCTYPES_FETCH
								}?income_type=${allCoApplicantUniqueIncomeTypeIds.join(',')}`
							);
							// console.log(
							// 	'🚀 ~ file: DocumentUpload.js:267 ~ initializeDocTypeList ~ coAppDocTypesRes:',
							// 	coAppDocTypesRes
							// );

							const nonApplicantDocTypeMapping = {};
							allCoApplicantUniqueIncomeTypeIds?.forEach(
								(incomeType, incomeTypeIndex) => {
									nonApplicantDocTypeMapping[incomeType] =
										coAppDocTypesRes?.data?.data?.[incomeTypeIndex] || [];
								}
							);
							nonApplicantDirectorsArray?.forEach(director => {
								const selectedIncomeTypeDocs =
									nonApplicantDocTypeMapping[(director?.income_type)];
								for (const key in selectedIncomeTypeDocs) {
									selectedIncomeTypeDocs[key]?.forEach(docType => {
										const category = getDocumentCategoryName(docType?.doc_type);
										const newDoc = {
											...docType,
											doc_type_id: docType?.id,
											type_name: director?.type_name,
											value: docType?.id,
											category,
											directorId: director?.directorId,
										};
										newAllDocumentTypes.push(newDoc);
									});
								}
							});
							// console.log('coAppDocTypesRes-', { coAppDocTypesRes });
							// coAppDocTypesRes?.data?.data?.forEach(
							// 	(nonApplicantDocs, nonApplicantIndex) => {
							// 		for (const key in nonApplicantDocs) {
							// 			nonApplicantDocs[key]?.forEach(docType => {
							// 				const category = getDocumentCategoryName(
							// 					docType?.doc_type
							// 				);
							// 				const newDoc = {
							// 					...docType,
							// 					doc_type_id: docType?.id,
							// 					type_name:
							// 						nonApplicantDirectorsArray?.[nonApplicantIndex]
							// 							?.type_name,
							// 					value: docType?.id,
							// 					category,
							// 					directorId:
							// 						nonApplicantDirectorsArray?.[nonApplicantIndex]
							// 							?.directorId,
							// 				};
							// 				newAllDocumentTypes.push(newDoc);
							// 			});
							// 		}
							// 	}
							// );
						} catch (error) {
							console.error(
								'error-failted to fetch coapplicant document list-',
								error
							);
						}
					}
					// -- NON-APPLICANTS

					// FETCH ALL DOCUMENTS
					let preFillKycFinOtherDocs = [];
					let preFillLenderDocs = [];
					let preFillEvalDocs = [];
					try {
						const allDocumentsRes = await axios.get(
							`${
								API.GET_ALL_UPLOADED_DOCUMENTS_UIUX
								// API.GET_ALL_UPLOADED_DOCUMENTS
							}?loan_ref_id=${loanRefId}`
						);
						if (!allDocumentsRes) {
							setLoading(true);
						}
						// console.log('allDocumentsRes-', allDocumentsRes);
						if (
							allDocumentsRes?.data?.documentList?.is_aadhaar_verified_with_otp
						) {
							setIsAadhaarVerified(true);
						}

						if (
							allDocumentsRes?.data?.documentList?.lender_document?.length > 0
						) {
							// console.log(Object.values(selfieWithApplicantField?.doc_type));
							// console.log(Object.values(selfieWithCoapplicantField?.doc_type));

							const lenderDocs =
								allDocumentsRes?.data?.documentList?.lender_document;
							filteredSelfieDocs = lenderDocs.filter(
								doc =>
									Object.values(selfieWithApplicantField?.doc_type).includes(
										doc?.doc_type?.id
									) ||
									Object.values(selfieWithCoapplicantField?.doc_type).includes(
										doc?.doc_type?.id
									)
							);
							filteredSelfieDocs?.map(selfieDoc => {
								dispatch(addSelfieCacheDocument(selfieDoc));
								// dispatch(addCacheDocument(selfieDoc))
								return null;
							});
						}
						if (
							allDocumentsRes?.data?.documentList?.loan_document?.length > 0
						) {
							preFillKycFinOtherDocs = formatLoanDocuments({
								docs: allDocumentsRes?.data?.documentList?.loan_document,
								docTypes: newAllDocumentTypes,
								applicantDirectorId:
									applicantDirectorId || CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
							});
						}
						if (isViewLoan) {
							// console.log(
							// 	{
							// 		lenderDoc:
							// 			allDocumentsRes?.data?.documentList?.lender_document,
							// 		type: typeof allDocumentsRes?.data?.documentList
							// 			?.lender_document,
							// 		res: allDocumentsRes?.data,
							// 		applicantDirectorId,
							// 	},
							// );
							allDocumentsRes?.data?.documentList?.lender_document?.map(
								lenderDoc => {
									const docListItem = lenderDoc?.doc_type || {};
									const priority = docListItem?.priority || '300';
									const doctype = docListItem?.id || '';
									// console.log('2', { docListItem, priority, doctype });

									const name =
										lenderDoc?.uploaded_doc_name ||
										lenderDoc?.original_doc_name ||
										lenderDoc?.doc_name;
									const document_key = lenderDoc?.doc_name;
									let displayEvalDoc = false;
									if (userDetails.is_other) {
										if (lenderDoc.uploaded_by === userDetails.id) {
											displayEvalDoc = true;
										}
									} else {
										displayEvalDoc = true;
									}
									// console.log({
									// 	userDetails,
									// 	displayEvalDoc,
									// 	newAllDocumentTypes,
									// });
									if (displayEvalDoc) {
										if (priority === '300') {
											const doc_type_id = doctype;
											const category = CONST_SECTIONS.DOC_CATEGORY_LENDER;
											if (
												newAllDocumentTypes?.filter(
													d => `${d?.doc_type_id}` === `${doc_type_id}`
												)?.length <= 0
											) {
												newAllDocumentTypes.push({
													...docListItem,
													doc_type_id,
													category,
													directorId:
														applicantDirectorId ||
														CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
												});
											}
											preFillLenderDocs.push({
												...lenderDoc,
												doctype,
												doc_type_id,
												category,
												name,
												document_key,
												directorId:
													applicantDirectorId ||
													CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
												document_id: lenderDoc?.id,
											});
											return null;
										}
										// console.log({ preFillLenderDocs });
										if (priority === '3') {
											const doc_type_id = doctype;
											const category = CONST_SECTIONS.DOC_CATEGORY_EVAL;
											if (
												newAllDocumentTypes?.filter(
													d => d?.doc_type_id === doc_type_id
												)?.length <= 0
											) {
												newAllDocumentTypes.push({
													...docListItem,
													doc_type_id,
													category,
													directorId:
														applicantDirectorId ||
														CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
												});
											}
											// if it's other user and he has uploaded eval documents without document assignment he should be able to access these documents
											// this is to overwrite assignment document checklist
											// DOS-3031
											if (
												userDetails.is_other &&
												lenderDoc.uploaded_by === userDetails.id
											) {
												externalUserAllowedToViewDocTypeIds.push(
													`${applicantDirectorId}${doc_type_id}`
												);
											}

											preFillEvalDocs.push({
												...lenderDoc,
												doctype,
												doc_type_id,
												category,
												name,
												document_key,
												directorId:
													applicantDirectorId ||
													CONST.DEFAULT_DIRECTOR_ID_FOR_ENTITY,
												document_id: lenderDoc?.id,
											});
											return null;
										}
									}
									return null;
								}
							);
							// console.log('1111111-', {
							// 	files: [...preFillLenderDocsTag, ...preFillEvalDocsTag],
							// 	newAllDocumentTypes,
							// });
						}
					} catch (error) {}

					dispatch(
						addOrUpdateCacheDocumentsDocUploadPage({
							files: [
								...preFillKycFinOtherDocs,
								...preFillLenderDocs,
								...preFillEvalDocs,
							],
						})
					);
					// -- FETCH ALL DOCUMENTS

					// console.log('newAllDocumentTypes-', {
					// 	newAllDocumentTypes,
					// 	externalUserSelectedDocTypeIds,
					// 	filter: newAllDocumentTypes.filter(doc =>
					// 		externalUserSelectedDocTypeIds.includes(
					// 			`${doc?.directorId}${doc?.doc_type_id}`
					// 		)
					// 	),
					// });
					newAllDocumentTypes.sort((a, b) => a.id - b.id);
					if (externalUserAllowedToViewDocTypeIds.length > 0) {
						// only show document types which is assign to external user
						dispatch(
							addAllDocumentTypes(
								newAllDocumentTypes.filter(doc =>
									externalUserAllowedToViewDocTypeIds.includes(
										`${doc?.directorId}${doc?.doc_type_id}`
									)
								)
							)
						);
					} else {
						dispatch(addAllDocumentTypes(newAllDocumentTypes));
					}
					// console.log('DocumentUpload-isEditOrViewLoan-', { isEditOrViewLoan });
					// if (isEditOrViewLoan) {
					// 	const newDoc = [];
					// 	const clonedCacheDocuments = _.cloneDeep(cacheDocuments);
					// 	clonedCacheDocuments?.map(doc => {
					// 		// if (doc?.document_id) return null;
					// 		if (!doc?.directorId) {
					// 			doc.directorId = applicantDirectorId;
					// 		}
					// 		const selectedDocType =
					// 			newAllDocumentTypes.filter(docType => {
					// 				if (
					// 					`${docType.doc_type_id}` === `${doc.doctype}` ||
					// 					`${docType.doc_type_id}` === `${doc.doc_type_id}`
					// 				)
					// 					return true;
					// 				return false;
					// 			})?.[0] || {};

					// 		newDoc.push({
					// 			...selectedDocType,
					// 			...doc,
					// 		});
					// 		return null;
					// 	});
					// 	dispatch(
					// 		addOrUpdateCacheDocumentsDocUploadPage({
					// 			files: newDoc,
					// 		})
					// 	);
					// }
				} catch (error) {
					console.error('error-initializeComponent-', error);
				} finally {
					setLoading(false);
				}
			};

			const initializeCommentForOfficeUse = async () => {
				// if (isEditOrViewLoan && editLoanData?.remarks) {
				// const allRemarks = parseJSON(editLoanData?.remarks);
				// const allCommentsForOfficeUse = [];
				// Object.keys(allRemarks)?.map(key => {
				// 	if (!!allRemarks?.[key]?.is_comment_for_office_use) {
				// 		allCommentsForOfficeUse.push(allRemarks[key]);
				// 	}
				// 	return null;
				// });
				// try {
				// 	allCommentsForOfficeUse.sort(
				// 		(a, b) => moment(b.datetime) - moment(a.datetime)
				// 	);
				// } catch (e) {}
				// setCommentsFromEditLoanData(allCommentsForOfficeUse?.[0]?.comment);
				// if (allCommentsForOfficeUse?.length > 0) {
				// 	dispatch(
				// 		setCommentsForOfficeUse(
				// 			allCommentsForOfficeUse?.[0]?.comment || ''
				// 		)
				// 	);
				// }
				// console.log('allremarks-', {
				// 	allRemarks,
				// 	allCommentsForOfficeUse,
				// 	newcomment: allCommentsForOfficeUse?.[0]?.comment || '',
				// });
				// }

				// };
				if (isEditOrViewLoan) {
					const allCommentsRes = await axios.get(
						`${API.GET_COMMENTS}?loanId=${loanId}`
					);
					const allCommentsForOfficeUse = allCommentsRes?.data?.data?.filter(
						comment => comment?.is_comment_for_office_use
					);
					// console.log(
					// 	'🚀 ~ file: DocumentUpload.js:632 ~ useEffect ~ allCommentsForOfficeUse:',
					// 	allCommentsForOfficeUse
					// );
					try {
						allCommentsForOfficeUse.sort(
							(a, b) => moment(b.datetime) - moment(a.datetime)
						);
					} catch (e) {}
					setCommentsFromEditLoanData(allCommentsForOfficeUse?.[0]?.comment);
					if (allCommentsForOfficeUse?.length > 0) {
						dispatch(
							setCommentsForOfficeUse(
								allCommentsForOfficeUse?.[0]?.comment || ''
							)
						);
					}
				}
			};
			initializeDocTypeList();
			initializeCommentForOfficeUse();
			// if (isGeoTaggingEnabled) {
			// 	setGeoLocationData(selectedDirector?.onSiteSelfieGeoLocation || {});
			// }
			// FUNCTION TO MAP SELFIE PICS FROM CACHE DOCUMENTS
			async function fetchSelfieData() {
				try {
					setSubmitting(true);
					let section = selectedSection?.sub_sections?.filter(
						section => section?.id === CONST.SELFIE_UPLOAD_SECTION_ID
					)?.[0];
					let selectedField = section?.fields?.filter(field => {
						if (field?.hasOwnProperty('is_applicant')) {
							if (field.is_applicant === false && isApplicant) {
								return null;
							} else {
								return field;
							}
						}
						if (field?.hasOwnProperty('is_co_applicant')) {
							if (field.is_co_applicant === false && !isApplicant) {
								return null;
							} else {
								return field;
							}
						}
						return null;
					})?.[0];
					if (selectedField) {
						const selfieDocType = selfieWithApplicantField?.doc_type?.[
							selectedDirector?.income_type
						]
							? selfieWithApplicantField?.doc_type?.[
									selectedDirector?.income_type
							  ]
							: selfieWithApplicantField?.doc_type?.[businessType];
						// console.log(filteredSelfieDocs,"filtered Selfie DOcs");
						const file = cacheDocuments
							? cacheDocuments?.filter(
									doc =>
										`${doc?.directorId}` === `${selectedDirectorId}` &&
										`${doc?.doc_type?.id}` === `${selfieDocType}`
							  )?.[0]
							: filteredSelfieDocs?.filter(
									doc =>
										`${doc?.directorId}` === `${selectedDirectorId}` &&
										`${doc?.doc_type?.id}` === `${selfieDocType}`
							  )?.[0];
						if (file && Object.keys(file).length > 0) {
							const newCatchFiles = _.cloneDeep(cacheFile);
							cacheFile.selectedDirectorId = { file };
							setCacheFile(newCatchFiles);
							// if (isGeoTaggingEnabled) {
							// 	if (
							// 		!file?.loan_document_details?.[0]?.lat &&
							// 		!file?.loan_document_details?.[0]?.long
							// 	) {
							// 		dispatch(
							// 			setOnSiteSelfieGeoLocation({
							// 				err: 'Geo Location Not Captured',
							// 			})
							// 		);
							// 		return;
							// 	}
							// 	const reqBody = {
							// 		lat: file?.loan_document_details?.[0]?.lat,
							// 		long: file?.loan_document_details?.[0]?.long,
							// 	};
							// 	const geoLocationRes = await axios.post(
							// 		API.GEO_LOCATION,
							// 		reqBody,
							// 		{
							// 			headers: {
							// 				Authorization: `Bearer ${userToken}`,
							// 			},
							// 		}
							// 	);
							// 	if (selectedDirectorId === '0') {
							// 		setEntitiyGeoLocation(geoLocationRes?.data?.data);
							// 		return;
							// 	}
							// 	const fileDirectorId = file.directorId;
							// 	const reqObject = {
							// 		...geoLocationRes?.data?.data,
							// 		directorId: fileDirectorId,
							// 	};
							// 	dispatch(setOnSiteSelfieGeoLocation(reqObject));
							// }
						}
					}
				} catch (err) {
					addToast({
						message:
							err?.response?.data?.message ||
							err?.message ||
							'Oops! Something went wrong',
						type: 'error',
					});
				} finally {
					setSubmitting(false);
				}
			}
			fetchSelfieData();

			// SET MANDATORY FIELDS IN DOC UPLOAD SECTION TO APPLICANT/COAPPLICANT
			function saveMandatoryGeoLocation() {
				selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
					sub_section?.fields?.map((field, fieldIndex) => {
						if (field.hasOwnProperty('geo_tagging') && field?.geo_tagging) {
							if (field?.db_key === 'on_site_selfie') {
								let reduxStoreKey = 'onSiteSelfieGeoLocation';
								dispatch(
									setGeotaggingMandatoryFields({
										directorId: selectedDirectorId,
										field: reduxStoreKey,
									})
								);
							}
						}
						return null;
					});
					return null;
				});
			}
			if (isGeoTaggingEnabled) {
				saveMandatoryGeoLocation();
			}
		}
		// eslint-disable-next-line
	}, []);
	useLayoutEffect(() => {
		dispatch(resetCacheDocuments());
	}, []);
	// const buttonDisabledStatus = () => {
	// 	return !(cibilCheckbox && declareCheck);
	// };

	const onSubmitOtpAuthentication = async () => {
		try {
			setSubmittingOtp(true);
			// console.log('step-1');
			// TODO: varun fix and enable GEO validation after Individual and SME flow is completed
			// const check = validateGeoTaggedDocsForApplicantCoapplicant();
			// // console.log('step-2', { check });
			// if (check?.isAllTheDocumentsPresent !== true) {
			// 	setOnSiteVerificationModal(true);
			// 	// console.log('step-3');
			// 	return;
			// }
			// console.log('step-4');
			// if (buttonDisabledStatus()) return;
			// console.log('step-5');
			// change permission here
			// if (
			// 	// selectedProduct?.product_details?.kyc_verification &&
			// 	isGeoTaggingEnabled &&
			// 	!isAppCoAppVerificationComplete()
			// ) {
			// 	// console.log('step-6');
			// 	// setOnsiteVerificationErr(true);
			// 	return;
			// }
			// console.log('step-7');
			if (!isFormValid()) return;
			// console.log('step-8');
			await onSubmitCompleteApplication({ goToNextSection: false });
			// console.log('step-9');
			// pass only applicant because selected applicant can be co-applicant-1-2-3 and user can still press submit CTA
			const authenticationOtpReqBody = {
				mobile: +applicantOrEntityMobileNumber,
				business_id: businessId,
				product_id: selectedProduct.id,
			};
			// console.log('step-10', { authenticationOtpReqBody });
			// let authenticateOtp =
			// -- api-3 - generate otp
			await axios.post(
				API.AUTHENTICATION_GENERATE_OTP,
				authenticationOtpReqBody
			);
			// console.log('step-11');
			setIsAuthenticationOtpModalOpen(true);
		} catch (error) {
			if (error?.response?.data?.timer) {
				setIsAuthenticationOtpModalOpen(true);
				setGenerateOtpTimer(error?.response?.data?.timer || 0);
			}
			console.error(error);
			addToast({
				message:
					error?.response?.data?.message || 'Server down, try after sometime',
				type: 'error',
			});
		} finally {
			setSubmittingOtp(false);
		}
	};
	// console.log(submittingOtp);

	const isFormValid = () => {
		let isDocTypeUnTagged = false;
		cacheDocuments?.map(doc => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (doc?.req_type) return null;
			if (!(doc?.doc_type_id || doc?.doc_type?.id)) {
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
		// console.log(cacheDocuments);
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
					'Please upload all the mandatory documents to submit the application',
				type: 'error',
			});
			return false;
		}
		if (!commentsForOfficeUse && isCommentRequired) {
			addToast({
				message: 'Comments are mandatory. Please enter the comments',
				type: 'error',
			});
			return false;
		}
		return true;
	};

	const onSaveAndProceed = () => {
		dispatch(setCompletedApplicationSection(selectedSectionId));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const onSubmitCompleteApplication = async (data = {}) => {
		const { goToNextSection } = data;

		if (!validateOnSiteSelfie()) {
			setOnSiteVerificationModal(true);
			return;
		}
		// TODO: varun fix and enable GEO validation after Individual and SME flow is completed
		// if (isEditLoan) {
		// 	const check = validateGeoTaggedDocsForApplicantCoapplicant();
		// 	if (check?.isAllTheDocumentsPresent !== true) {
		// 		setOnSiteVerificationModal(true);
		// 		return;
		// 	}
		// }
		// console.log('step-1');
		// if (buttonDisabledStatus()) return;
		// console.log('step-2');

		if (!isFormValid()) return;
		// console.log('step-3');
		try {
			// console.log('step-4');
			setSubmitting(true);
			// --api-1
			if (commentsForOfficeUse !== commentsFromEditLOanData) {
				await submitCommentsForOfficeUse();
			}
			// console.log('step-5');
			const documentUploadReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
			});
			// console.log('step-6');
			const newUploadedDocuments = [];
			cacheDocuments?.map(doc => {
				if (doc?.document_id) return null;

				// all network error related document will be filtered here
				// TODO: temporory solution these kind of document should be highlighted
				// and this should be hanled each individual document upload or taging phase
				if (!doc?.document_key) return null;

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

			// --api-2 - borrower doc api
			if (documentUploadReqBody.data.document_upload.length > 0) {
				const borrowerDocUploadRes = await axios.post(
					`${API.BORROWER_UPLOAD_URL}`,
					documentUploadReqBody
				);
				const updateDocumentIdToCacheDocuments = [];
				newUploadedDocuments.map(cacheDoc => {
					const resDoc =
						borrowerDocUploadRes?.data?.data?.filter(
							resDoc => resDoc?.doc_name === cacheDoc?.document_key
						)?.[0] || {};
					const newDoc = {
						...resDoc,
						...cacheDoc,
						document_id: resDoc?.id,
						id: resDoc?.id,
					};
					updateDocumentIdToCacheDocuments.push(newDoc);
					return null;
				});
				// console.log(
				// 	'updateDocumentIdToCacheDocuments',
				// 	updateDocumentIdToCacheDocuments
				// );
				// dispatch(
				// 	addOrUpdateCacheDocumentsDocUploadPage({
				// 		files: updateDocumentIdToCacheDocuments,
				// 	})
				// );
			}

			// console.log('onSubmitCompleteApplication-documentUploadRes', {
			// 	documentUploadRes,
			// });

			if (
				(goToNextSection ||
					selectedProduct?.product_details?.otp_authentication === false) &&
				(isEditLoan || (!isEditLoan && !isViewLoan))
			) {
				onSaveAndProceed();
			}
		} catch (error) {
			console.error('error-onSubmitCompleteApplication-', error);
			addToast({
				message:
					getApiErrorMessage(error) || 'Server down. Please try after sometime',
				type: 'error',
			});
		} finally {
			// TODO: move this logic to try balock
			setSubmitting(false);
		}
		// TODO: dispatch action for final submission
		setLoading(false);
	};

	const submitCommentsForOfficeUse = async () => {
		try {
			if (!commentsForOfficeUse) return;
			setSavingComments(true);
			const commentReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: {},
			});
			commentReqBody.comments_for_office_use = commentsForOfficeUse;
			await axios.post(`${API.ADD_COMMENTS_FOR_OFFICE_USE}`, commentReqBody);
		} catch (error) {
			console.error('error-submitCommentsForOfficeUse-', error);
		} finally {
			setSavingComments(false);
		}
	};

	const toggleOpenSection = sectionId => {
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
	let applicationOTPAuthentication = true;
	// if (selectedProduct?.product_details?.otp_authentication ) {
	// 	applicationOTPAuthentication = true;
	// 	if (isEditLoan && !isDraftLoan) {
	// 		// skip otp in edit mode
	// 		applicationOTPAuthentication = false;
	// 	} else if (
	// 		selectedProduct?.product_details
	// 			?.if_aadhaar_verified_skip_otp_authentication &&
	// 		isAadhaarVerified
	// 	) {
	// 		applicationOTPAuthentication = false;
	// 	}
	// }

	if (selectedProduct?.product_details?.otp_authentication !== false) {
		if (
			selectedProduct?.product_details
				?.if_aadhaar_verified_skip_otp_authentication &&
			isAadhaarVerified
		) {
			applicationOTPAuthentication = false;
		}
		if (isEditLoan && !isDraftLoan) {
			applicationOTPAuthentication = false;
		}
	} else {
		applicationOTPAuthentication = false;
	}
	// selectedProduct?.product_details?.otp_authentication &&
	// (isDraftLoan || !isEditLoan)
	if (applicationOTPAuthentication) {
		displayProceedButton = (
			<Button
				name='Submit'
				fill
				style={{
					width: '200px',
					background: 'blue',
				}}
				isLoader={submittingOtp || submitting}
				disabled={
					submittingOtp || submitting
					// || buttonDisabledStatus()
				}
				onClick={() => {
					if (submittingOtp && submitting) return;
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
				disabled={
					submitting
					// || buttonDisabledStatus()
				}
				onClick={() => {
					if (submitting) return;
					onSubmitCompleteApplication({ goToNextSection: true });
				}}
			/>
		);
	}

	const validateOnSiteSelfie = () => {
		// console.log({
		// 	cacheDocuments,
		// 	isSelfieWithApplicantOrEntityRequired,
		// 	isSelfieWithCoApplicantRequired,
		// 	selectedSection,
		// 	selectedDirector,
		// 	selfieWithApplicantField,
		// 	selfieWithCoapplicantField,
		// 	selectedProduct,
		// 	directors,
		// });
		let allowProceed = true;

		// For Applicant in Individual loan
		// if (`${selectedProduct?.loan_request_type}` === '2') {
		if (
			permission?.geo_tagging?.geo_tagging &&
			selfieWithApplicantField?.geo_tagging &&
			isSelfieWithApplicantOrEntityRequired
		) {
			const docTypeId =
				selfieWithApplicantField?.doc_type?.[
					selectedDirector?.income_type || businessType
				];
			// console.log({ applicantdid: docTypeId });
			const filteredApplicantDoc = cacheDocuments?.filter(item => {
				const docTypeIdApplicant =
					item?.doc_type_id || item?.doc_type?.id || '';
				return `${docTypeIdApplicant}` === `${docTypeId}`;
			});
			const applicantLatitude =
				filteredApplicantDoc?.[0]?.latitude ||
				filteredApplicantDoc?.[0]?.loan_document_details?.[0]?.lat;
			const applicantLongitude =
				filteredApplicantDoc?.[0]?.longitude ||
				filteredApplicantDoc?.[0]?.loan_document_details?.[0]?.long;

			if (
				(!applicantLatitude && !applicantLongitude) ||
				filteredApplicantDoc?.length === 0
			) {
				// console.log('i fell here !');
				allowProceed = false;
			}
		}

		// For CoApplicants in Individual loan
		if (
			permission?.geo_tagging?.geo_tagging &&
			selfieWithCoapplicantField?.geo_tagging &&
			isSelfieWithCoApplicantRequired
		) {
			let coApplicantOrDirectors = [];
			const coApplicants = Object.values(directors)?.filter(
				dir => dir?.type_name === 'Co-applicant'
			);
			const directorsAndCoapplicants = Object.values(directors)?.filter(
				dir => dir?.type_name !== 'Applicant'
			);
			if (`${selectedProduct?.loan_request_type}` === '2') {
				coApplicantOrDirectors = coApplicants;
			}
			if (`${selectedProduct?.loan_request_type}` === '1') {
				coApplicantOrDirectors = directorsAndCoapplicants;
			}
			if (coApplicantOrDirectors?.length > 0) {
				// console.log({ selfieWithCoapplicantField });
				coApplicantOrDirectors?.map(dir => {
					const docTypeId =
						selfieWithCoapplicantField?.doc_type?.[
							dir?.income_type || businessType
						];
					const filteredDoc = cacheDocuments?.filter(doc => {
						const docTypeIdCoapplicant = doc?.doc_type_id || doc?.doc_type?.id;
						// console.log({ docTypeIdCoapplicant, docTypeId });
						return `${docTypeIdCoapplicant}` === `${docTypeId}`;
					});
					// tbd
					// console.log({
					// 	filteredDoc,
					// 	coApplicantOrDirectors,
					// 	cacheDocuments,

					// 	docTypeId,
					// });

					if (filteredDoc?.length === 0) allowProceed = false;
					if (filteredDoc?.length < coApplicantOrDirectors?.length)
						allowProceed = false;
					if (filteredDoc?.length > 0) {
						for (const coAppSelfieItem of filteredDoc) {
							const coAppLatitude =
								coAppSelfieItem?.latitude ||
								coAppSelfieItem?.loan_document_details?.[0].lat;
							const coAppLongitude =
								coAppSelfieItem?.longitude ||
								coAppSelfieItem?.loan_document_details?.[0].long;
							// console.log({ coAppLatitude, coAppLongitude });
							if (!coAppLatitude && !coAppLongitude) {
								// console.log('failing in coapp');
								allowProceed = false;
								break;
							}
						}
					}
					return null;
				});
			}
		}
		// }
		// For Business loan
		// if (`${selectedProduct?.loan_request_type}` === '1') {
		// 	if (
		// 		permission?.geo_tagging?.geo_tagging &&
		// 		selfieWithApplicantField?.geo_tagging &&
		// 		isSelfieWithApplicantOrEntityRequired
		// 	) {
		// 		const docTypeId =
		// 			selfieWithApplicantField?.doc_type?.[
		// 				selectedDirector?.income_type || businessType
		// 			];
		// 		// console.log({ applicantdid: docTypeId });
		// 		const filteredApplicantDoc = cacheDocuments?.filter(item => {
		// 			const docTypeIdApplicant =
		// 				item?.doc_type_id || item?.doc_type?.id || '';
		// 			return `${docTypeIdApplicant}` === `${docTypeId}`;
		// 		});
		// 		const applicantLatitude =
		// 			filteredApplicantDoc?.[0]?.latitude ||
		// 			filteredApplicantDoc?.[0]?.loan_document_details?.[0]?.lat;
		// 		const applicantLongitude =
		// 			filteredApplicantDoc?.[0]?.longitude ||
		// 			filteredApplicantDoc?.[0]?.loan_document_details?.[0]?.long;

		// 		if (
		// 			(!applicantLatitude && !applicantLongitude) ||
		// 			filteredApplicantDoc?.length === 0
		// 		) {
		// 			console.log('i fell here !');
		// 			allowProceed = false;
		// 		}
		// 	}

		// 	if (
		// 		permission?.geo_tagging?.geo_tagging &&
		// 		selfieWithCoapplicantField?.geo_tagging &&
		// 		isSelfieWithCoApplicantRequired
		// 	) {
		// 		const directorsAndCoapplicants = Object.values(directors)?.filter(
		// 			dir => dir?.type_name !== 'Applicant'
		// 		);
		// 		if (directorsAndCoapplicants?.length > 0) {
		// 			directorsAndCoapplicants?.map(dir => {
		// 				const docTypeId =
		// 					selfieWithCoapplicantField?.doc_type?.[
		// 						dir?.income_type || businessType
		// 					];
		// 				const filteredDoc = cacheDocuments?.filter(doc => {
		// 					const docTypeIdCoapplicant =
		// 						doc?.doc_type_id || doc?.doc_type?.id;
		// 					console.log({ docTypeIdCoapplicant, docTypeId });
		// 					return `${docTypeIdCoapplicant}` === `${docTypeId}`;
		// 				});
		// 				// tbd
		// 				console.log({
		// 					filteredDoc,
		// 					directorsAndCoapplicants,
		// 					cacheDocuments,

		// 					docTypeId,
		// 				});

		// 				if (filteredDoc?.length === 0) allowProceed = false;
		// 				if (filteredDoc?.length < directorsAndCoapplicants?.length)
		// 					allowProceed = false;
		// 				if (filteredDoc?.length > 0) {
		// 					for (const coAppSelfieItem of filteredDoc) {
		// 						const coAppLatitude =
		// 							coAppSelfieItem?.latitude ||
		// 							coAppSelfieItem?.loan_document_details?.[0].lat;
		// 						const coAppLongitude =
		// 							coAppSelfieItem?.longitude ||
		// 							coAppSelfieItem?.loan_document_details?.[0].long;
		// 						console.log({ coAppLatitude, coAppLongitude });
		// 						if (!coAppLatitude && !coAppLongitude) {
		// 							console.log('failing in coapp');
		// 							allowProceed = false;
		// 							break;
		// 						}
		// 					}
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// console.log({
		// 	allowProceed,

		// 	cacheDocuments,
		// 	isSelfieWithCoApplicantRequired,
		// 	isSelfieWithApplicantOrEntityRequired,
		// });

		return allowProceed;
	};

	// const validateOnSiteSelfie = () => {
	// 	// console.log({
	// 	// 	cacheDocuments,
	// 	// 	isSelfieWithApplicantOrEntityRequired,
	// 	// 	isSelfieWithCoApplicantRequired,
	// 	// 	selectedSection,
	// 	// 	selectedDirector,
	// 	// 	selfieWithApplicantField,
	// 	// 	selfieWithCoapplicantField,
	// 	// 	selectedProduct,
	// 	// 	directors,
	// 	// });
	// 	let allowProceed = true;
	// 	console.log(isSelfieWithApplicantOrEntityRequired);
	// 	if (
	// 		permission?.geo_tagging?.geo_tagging &&
	// 		selfieWithApplicantField?.geo_tagging &&
	// 		isSelfieWithApplicantOrEntityRequired
	// 	) {
	// 		const docTypeId =
	// 			selfieWithApplicantField?.doc_type?.[
	// 				selectedDirector?.income_type || businessType
	// 			];
	// 		// console.log({ applicantdid: docTypeId });
	// 		const filteredApplicantDoc = cacheDocuments?.filter(item => {
	// 			return (
	// 				`${item?.doc_type_id}` === `${docTypeId}` ||
	// 				`${item?.doc_type?.id}` === `${docTypeId}`
	// 			);
	// 		});
	// 		console.log(filteredApplicantDoc, 'filterered applicant doc');
	// 		if (filteredApplicantDoc?.length === 0) allowProceed = false;
	// 	}
	// 	console.log(
	// 		permission?.geo_tagging?.geo_tagging &&
	// 			selfieWithCoapplicantField?.geo_tagging
	// 		// isSelfieWithCoApplicantRequired
	// 	);

	// 	if (
	// 		permission?.geo_tagging?.geo_tagging &&
	// 		selfieWithCoapplicantField?.geo_tagging &&
	// 		// isSelfieWithCoApplicantRequired
	// 		true
	// 	) {
	// 		console.log(cacheDocuments, 'cacheDoc ');
	// 		const coApplicants = Object.values(directors)?.filter(
	// 			dir => dir?.type_name === 'Co-applicant'
	// 		);
	// 		if (coApplicants?.length > 0) {
	// 			coApplicants?.map(dir => {
	// 				const docTypeId =
	// 					selfieWithCoapplicantField?.doc_type?.[
	// 						dir?.income_type || businessType
	// 					];
	// 				console.log(docTypeId);
	// 				const filteredDoc = cacheDocuments?.filter(doc => {
	// 					return (
	// 						`${doc?.doc_type_id}` === `${docTypeId}` ||
	// 						`${doc?.doc_type.id}` === `${docTypeId}`
	// 					);
	// 				});
	// 				console.log(filteredDoc, 'filterered doc');
	// 				if (filteredDoc.length === 0) allowProceed = false;
	// 				if (filteredDoc.length > 0) {
	// 					for (const coAppSelfieItem of filteredDoc) {
	// 						if (
	// 							!coAppSelfieItem?.latitutde ||
	// 							!coAppSelfieItem?.longitude ||
	// 							!coAppSelfieItem?.loan_document_details?.[0].lat ||
	// 							!coAppSelfieItem?.loan_document_details?.[0]?.long
	// 						) {
	// 							console.log('i fell here');
	// 							allowProceed = false;
	// 							break;
	// 						}
	// 					}
	// 				}
	// 			});
	// 		}
	// 	}
	// 	return allowProceed;
	// };

	const mandatoryDocumentTypeIds = [];
	allDocumentTypes.map(doc => {
		const UNIQ_DOC_ID = `${doc?.directorId}${doc?.doc_type_id}`;
		if (mandatoryDocumentTypeIds.includes(UNIQ_DOC_ID)) return null;
		if (!!doc?.isMandatory) {
			mandatoryDocumentTypeIds.push(UNIQ_DOC_ID);
		}
		return null;
	});
	const totalMandatoryDocumentCount = mandatoryDocumentTypeIds.length;

	const mendatoryDocIdTracker = [];
	cacheDocuments?.map(doc => {
		const UNIQ_DOC_ID = `${doc?.directorId}${doc?.doc_type_id}`;
		if (mendatoryDocIdTracker.includes(UNIQ_DOC_ID)) return null;
		if (mandatoryDocumentTypeIds.includes(UNIQ_DOC_ID)) {
			mendatoryDocIdTracker.push(UNIQ_DOC_ID);
		}
		return null;
	});
	const totalMandatoryUploadedDocumentCount = mendatoryDocIdTracker.length;

	let displayUploadedDocCount = true;
	if (userDetails?.is_other === 1 && isViewLoan) {
		displayUploadedDocCount = false;
	}

	const addCacheDocumentTemp = async file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);

		if (isGeoTaggingEnabled) {
			if (file?.latitude === 'null' || !file.hasOwnProperty('latitude')) {
				const geoLocationTag = {
					err: 'Geo Location Not Captured',
				};
				const reqObject = {
					...geoLocationTag,
					directorId: selectedDirectorId,
				};
				dispatch(setOnSiteSelfieGeoLocation(reqObject));
				if (selectedDirectorId === '0') {
					setEntitiyGeoLocation(geoLocationTag);
					return;
				}
			} else {
				const geoLocationTag = {
					address: file?.address,
					lat: file?.latitude,
					long: file?.longitude,
					timestamp: file?.timestamp,
					directorId: selectedDirectorId,
				};
				if (selectedDirectorId === '0') {
					setEntitiyGeoLocation(geoLocationTag);
					return;
				}
				dispatch(setOnSiteSelfieGeoLocation(geoLocationTag));
			}
		}
		const newCatchFiles = _.cloneDeep(cacheFile);
		cacheFile.selectedDirectorId = { file };
		setCacheFile(newCatchFiles);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};

	const profileUploadedFile =
		// cacheDocumentsTemp?.[0] ||
		// cacheDocumentsTemp?.filter(
		// 	doc => doc?.field?.name === CONST.SELFIE_UPLOAD_FIELD_NAME
		// )?.[0] ||
		cacheDocuments?.filter(
			doc =>
				doc?.field?.db_key === CONST.SELFIE_UPLOAD_FIELD_NAME &&
				`${doc?.directorId}` === `${selectedDirectorId}`
		)?.[0] || null;

	// console.log(cacheDocuments, 'cacheDocs');

	// console.log({
	// 	selectedDirector,
	// 	selectedDirIncomeType: selectedDirector?.income_type,
	// 	selfieWithApplicantField,
	// 	selfieWithCoapplicantField,
	// });

	// // const selectedSelfieUploadField = getSelectedField({
	// // 	fieldName: CONST.
	// // })

	const selfieDocNameForCoapps = ['Co-applicant', 'Director']?.includes(
		selectedDirector?.type_name
	)
		? selfieWithCoapplicantField
		: selfieWithApplicantField;
	// const selfieDocNameForCoapps = ['co-applicant', 'director']?.includes(selectedDirector?.type_name) ? selfieWithCoapplicantField : selfieWithApplicantField
	// console.log(cacheDocuments);

	const selfieDocType = selfieDocNameForCoapps?.doc_type?.[
		selectedDirector?.income_type
	]
		? selfieDocNameForCoapps?.doc_type?.[selectedDirector?.income_type]
		: selfieDocNameForCoapps?.doc_type?.[businessType];

	const selfieImageUploadedFile =
		cacheDocuments?.filter(
			doc =>
				`${doc?.directorId}` === `${selectedDirectorId}` &&
				`${doc?.doc_type?.id}` === `${selfieDocType}`
		)?.[0] || null;
	const selfieImageUploadFileArray = cacheDocuments?.filter(
		doc => `${doc?.doc_type?.id}` === `${selfieDocType}`
	);

	useEffect(() => {
		selfieImageUploadFileArray?.map(selfie => {
			const fileDirectorId = selfie?.directorId;
			setFetchedDirectors({ ...fetchedDirectors, [fileDirectorId]: true });
			if (
				(!!directors?.[fileDirectorId]?.onSiteSelfieGeoLocation ||
					(`${fileDirectorId}` === `0` && !entityGeolocation)) &&
				!fetchedDirectors?.[fileDirectorId] &&
				(permission?.geo_tagging?.geo_tagging &&
					selfieWithApplicantField?.geo_tagging)
			) {
				async function geoTagging() {
					try {
						if (isGeoTaggingEnabled) {
							const reqBody = {
								lat: selfie?.loan_document_details?.[0]?.lat,
								long: selfie?.loan_document_details?.[0]?.long,
							};
							const geoLocationRes = await axios.post(
								API.GEO_LOCATION,
								reqBody,
								{
									headers: {
										Authorization: `Bearer ${userToken}`,
									},
								}
							);

							const reqObject = {
								...geoLocationRes?.data?.data,
								directorId: fileDirectorId,
							};
							if (fileDirectorId === 0) {
								setEntitiyGeoLocation(geoLocationRes?.data?.data);
							}
							dispatch(setOnSiteSelfieGeoLocation(reqObject));
						}
					} catch (err) {
						dispatch(
							setOnSiteSelfieGeoLocation({
								err: 'Geo Location Not Captured',
								directorId: fileDirectorId,
							})
						);
					}
				}
				geoTagging();
			}
			return null;
		});
		// eslint-disable-next-line
	}, [cacheDocuments, selectedDirector]);

	// console.log(selfieImageUploadedFile, 'image');
	// console.log(cacheDocuments);
	const closeVerificationMsgModal = () => {
		dispatch(setIsPrompted(true));
		setOnsiteVerificationMsg(false);
	};

	const closeVerificationErrModal = () => {
		// setOnsiteVerificationErr(false);
		setOnSiteVerificationModal(false);
	};

	// TO CHECK IF ONSITE VERIFICATION IS COMPLETE OR NOT..
	const isAppCoAppVerificationComplete = () => {
		let result = true;
		selectedDirectorOptions.map(director => {
			if (Number(applicantDirectorId) === Number(director.value)) {
				if (
					Object.keys(selectedDirector?.onSiteSelfieGeoLocation || {}).length <=
					0
				) {
					result = false;
				}
			} else {
				if (
					Object.keys(
						nonApplicantDirectorsObject?.[director.value]
							?.onSiteSelfieGeoLocation || {}
					).length <= 0
				) {
					result = false;
				}
			}
			return null;
		});
		return result;
	};

	// TO CHECK IF APPLICANT AND COAPPLICANT PROFILE-PIC/SELFIE IS UPLOADED IF IT IS MANDATORY (returns an object { missingDocsForDirectors, isAllTheDocumentsPresent: false/true })
	// const validateGeoTaggedDocsForApplicantCoapplicant = () => {
	// 	const documentCheckStatus = {
	// 		isAllTheDocumentsPresent: true,
	// 	};
	// 	const clonedCacheDocuments = _.cloneDeep(cacheDocuments);
	// 	const applicantCoapplicantDoc = [];

	// 	let mandatoryFieldApplicant = {};
	// 	let mandatoryFieldCoApplicant = {};
	// 	const onSiteSelfiefield = selectedSection?.sub_sections?.filter(
	// 		subSection => subSection?.id === 'on_site_selfie_with_applicant'
	// 	)?.[0];
	// 	if (onSiteSelfiefield?.fields?.length > 0) {
	// 		mandatoryFieldApplicant = onSiteSelfiefield?.fields?.filter(
	// 			field => field?.geo_tagging === true && field?.is_co_applicant === false
	// 		)?.[0];
	// 		mandatoryFieldCoApplicant = onSiteSelfiefield?.fields?.filter(
	// 			field => field?.geo_tagging === true && field?.is_applicant === false
	// 		)?.[0];
	// 	}

	// 	if (
	// 		onSiteSelfiefield?.fields?.length === 1 &&

	// 	) {
	// 		mandatoryFieldApplicant = onSiteSelfiefield?.[0]?.fields[0];
	// 		mandatoryFieldCoApplicant = onSiteSelfiefield?.[0]?.fields[0];
	// 	}
	// 	// check for profile pic upload geolocation starts
	// 	const basicDetailsSection = selectedProduct?.product_details?.sections?.filter(
	// 		section => section?.id === CONST_SECTIONS.BASIC_DETAILS_SECTION_ID
	// 	)?.[0];

	// 	const profilePicField = basicDetailsSection?.sub_sections?.[0]?.fields?.filter(
	// 		field => field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
	// 	);

	// 	let mandatoryProfilePicFieldApplicant = {};
	// 	let mandatoryProfilePicFieldCoApplicant = {};
	// 	if (profilePicField?.length > 0) {
	// 		mandatoryProfilePicFieldApplicant = profilePicField?.filter(
	// 			field => field?.geo_tagging === true && field?.is_co_applicant === false
	// 		)?.[0];
	// 		mandatoryProfilePicFieldCoApplicant = profilePicField?.filter(
	// 			field => field?.geo_tagging === true && field?.is_applicant === false
	// 		)?.[0];
	// 	}
	// 	if (
	// 		profilePicField?.length === 1 &&
	// 		profilePicField[0]?.geo_tagging === true
	// 	) {
	// 		mandatoryProfilePicFieldApplicant = profilePicField[0];
	// 		mandatoryProfilePicFieldCoApplicant = profilePicField[0];
	// 	}

	// 	if (
	// 		!!mandatoryProfilePicFieldApplicant &&
	// 		Object.keys(mandatoryProfilePicFieldApplicant)?.length > 0
	// 	) {
	// 		applicantCoapplicantDoc?.push({
	// 			...mandatoryProfilePicFieldApplicant,
	// 			docTypeId:
	// 				mandatoryProfilePicFieldApplicant?.doc_type?.[selectedIncomeType],
	// 			directorId: applicantDirectorId,
	// 		});
	// 	}
	// 	if (
	// 		!!mandatoryProfilePicFieldCoApplicant &&
	// 		Object.keys(mandatoryProfilePicFieldCoApplicant)?.length > 0
	// 	) {
	// 		Object.keys(nonApplicantDirectorsObject)?.map(coApplicantId => {
	// 			const field = _.cloneDeep(mandatoryProfilePicFieldCoApplicant);
	// 			field.directorId = coApplicantId;
	// 			field.docTypeId = field?.doc_type?.[selectedIncomeType];
	// 			applicantCoapplicantDoc?.push(field);
	// 			return null;
	// 		});
	// 	}
	// 	// check for profile pic upload geolocation ends

	// 	// forming array with all the directors for mandatory selfie with app/coapp field
	// 	if (
	// 		!!mandatoryFieldApplicant &&
	// 		Object.keys(mandatoryFieldApplicant)?.length > 0
	// 	)
	// 		applicantCoapplicantDoc?.push({
	// 			...mandatoryFieldApplicant,
	// 			docTypeId: mandatoryFieldApplicant?.doc_type?.[selectedIncomeType],
	// 			directorId: applicantDirectorId,
	// 		});

	// 	if (
	// 		!!mandatoryFieldCoApplicant &&
	// 		Object.keys(mandatoryFieldCoApplicant)?.length > 0
	// 	) {
	// 		Object.keys(nonApplicantDirectorsObject)?.map(coApplicantId => {
	// 			const field = _.cloneDeep(mandatoryFieldCoApplicant);
	// 			field.directorId = coApplicantId;
	// 			field.docTypeId = field?.doc_type?.[selectedIncomeType];
	// 			applicantCoapplicantDoc?.push(field);
	// 			return null;
	// 		});
	// 	}
	// 	if (isEditLoan) {
	// 		const applicantProfile = editLoanData?.director_details?.filter(
	// 			dir => `${dir?.id}` === `${applicantDirectorId}`
	// 		)?.[0];

	// 		// const filterProfileDocData = clonedCacheDocuments?.filter(doc => {
	// 		// 	// console.log({ a: doc?.doc_type_id, d: doc?.directorId }, 'doc', {
	// 		// 	// 	a: mandatoryProfilePicFieldApplicant?.doc_type?.[selectedIncomeType],
	// 		// 	// 	d: applicant?.id,
	// 		// 	// });

	// 		// 	return (
	// 		// 		`${doc?.directorId}` === `${applicant?.id}` &&
	// 		// 		`${doc?.doc_type_id}` ===
	// 		// 			`${
	// 		// 				mandatoryProfilePicFieldApplicant?.doc_type?.[selectedIncomeType]
	// 		// 			}`
	// 		// 	);
	// 		// });

	// 		clonedCacheDocuments?.map(doc => {
	// 			if (
	// 				`${doc?.directorId}` === `${applicantDirectorId}` &&
	// 				`${doc?.doc_type_id}` ===
	// 					`${
	// 						mandatoryProfilePicFieldApplicant?.doc_type?.[selectedIncomeType]
	// 					}`
	// 			) {
	// 				doc.lat = applicantProfile?.lat;
	// 				doc.long = applicantProfile?.long;
	// 			}
	// 			return null;
	// 		});
	// 	}
	// 	const geoTaggedDocs = clonedCacheDocuments?.filter(
	// 		doc => doc?.hasOwnProperty('lat') && doc?.hasOwnProperty('long')
	// 	);
	// 	// final check - if the onSiteSelfieWith app/coapp document is present or not
	// 	const missingDocsForDirectors = [];
	// 	applicantCoapplicantDoc?.map(doc => {
	// 		const getMissingDocs = geoTaggedDocs?.filter(
	// 			directorField =>
	// 				`${directorField?.directorId}` === `${doc?.directorId}` &&
	// 				`${directorField?.doc_type_id}` === `${doc?.docTypeId}`
	// 		)?.[0];
	// 		if (!!getMissingDocs) {
	// 		} else {
	// 			missingDocsForDirectors?.push(`${doc?.directorId}`);
	// 		}
	// 		return null;
	// 	});

	// 	// Getting the missing On-site-verification documents of applicant/coapplicant
	// 	const applicantCoappliantIndex = [];
	// 	if (missingDocsForDirectors?.length > 0) {
	// 		const isApplicantImgMissing = missingDocsForDirectors?.indexOf(
	// 			`${applicantDirectorId}`
	// 		);
	// 		if (isApplicantImgMissing >= 0)
	// 			applicantCoappliantIndex?.push('Applicant');

	// 		Object.keys(nonApplicantDirectorsObject)?.map((coapp, index) => {
	// 			if (missingDocsForDirectors?.includes(`${coapp}`)) {
	// 				applicantCoappliantIndex?.push(`Co-Applicant ${index + 1}`);
	// 			}
	// 			return null;
	// 		});
	// 		documentCheckStatus.isAllTheDocumentsPresent = false;
	// 		documentCheckStatus.missingDocsForDirectors = [
	// 			...new Set(missingDocsForDirectors),
	// 		];
	// 		documentCheckStatus.directorList = [...new Set(applicantCoappliantIndex)];
	// 	}

	// 	// console.log({
	// 	// 	geoTaggedDocs,
	// 	// 	applicantCoapplicantDoc,
	// 	// 	missingDocsForDirectors,
	// 	// 	documentCheckStatus,
	// 	// 	mandatoryFieldApplicant,
	// 	// 	mandatoryFieldCoApplicant,
	// 	// 	mandatoryProfilePicFieldApplicant,
	// 	// 	mandatoryProfilePicFieldCoApplicant,
	// 	// 	cacheDocuments,
	// 	// 	applicant,
	// 	// });
	// 	return documentCheckStatus;
	// };

	// TO CHECK IF MANDATORY ONSITE VERIFICATION IS COMPLETE OR NOT
	// const isMandatoryGeoVerificationComplete = () => {
	// 	const appCoappsList = selectedDirectorOptions({
	// 		directors
	// 	});
	// 	if (
	// 		Object.keys(geoLocation).length > 0 &&
	// 		geoLocation.hasOwnProperty('err')
	// 	)
	// 		return false;
	// 	if (Object.keys(geoLocation).length <= 0) return false;
	// 	let result = true;
	// 	appCoappsList.map(director => {
	// 		if (Number(applicant.directorId) === Number(director.value)) {
	// 			if (
	// 				applicant.geotaggingMandatory.length > 0 &&
	// 				applicant.geotaggingMandatory.includes('profileGeoLocation')
	// 			) {
	// 				if (!applicant.profileGeoLocation?.address) {
	// 					result = false;
	// 				}
	// 			}
	// 			if (
	// 				applicant.geotaggingMandatory.length > 0 &&
	// 				applicant.geotaggingMandatory.includes('documentSelfieGeolocation')
	// 			) {
	// 				if (!applicant.documentSelfieGeolocation?.address) {
	// 					result = false;
	// 				}
	// 			}
	// 		} else {
	// 			if (
	// 				nonApplicantDirectorsObject?.[director.value]?.geotaggingMandatory.length > 0 &&
	// 				nonApplicantDirectorsObject?.[director.value]?.geotaggingMandatory.includes(
	// 					'profileGeoLocation'
	// 				)
	// 			) {
	// 				if (!nonApplicantDirectorsObject?.[director.value]?.profileGeoLocation?.address) {
	// 					result = false;
	// 				}
	// 			}
	// 			if (
	// 				nonApplicantDirectorsObject?.[director.value]?.geotaggingMandatory.length > 0 &&
	// 				nonApplicantDirectorsObject?.[director.value]?.geotaggingMandatory.includes(
	// 					'documentSelfieGeolocation'
	// 				)
	// 			) {
	// 				if (
	// 					!nonApplicantDirectorsObject?.[director.value]?.documentSelfieGeolocation?.address
	// 				) {
	// 					result = false;
	// 				}
	// 			}
	// 		}
	// 		return null;
	// 	});
	// 	return result;
	// };

	const removeCacheDocumentTemp = fieldName => {
		// setGeoLocationData({});
		dispatch(removeOnSiteSelfieGeoLocation());
		if (selectedDirectorId === '0') {
			setEntitiyGeoLocation(null);
		}
		const newCatchFiles = _.cloneDeep(cacheFile);
		delete newCatchFiles[selectedDirectorId];
		setCacheFile(newCatchFiles);
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		let docsTemp = cacheDocumentsTemp.filter(
			doc => doc?.field?.name === fieldName
		);
		if (docsTemp?.length > 0) {
			let temp = newCacheDocumentTemp.filter(
				doc => doc?.field?.name !== fieldName
			);
			setCacheDocumentsTemp(temp);
		}
	};

	// console.log('DocumentUpload-allstates-', {
	// 	app,
	// 	selectedDirector,
	// 	cacheDocuments,
	// 	cacheDocumentsTemp,
	// 	applicantDirectorId,
	// 	allDocumentTypes,
	// 	applicationOTPAuthentication,
	// 	selectedProduct,
	// 	isAadhaarVerified,
	// 	isEditLoan,
	// 	isDraftLoan,
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
					setContactNo={applicantOrEntityMobileNumber}
					setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
					generateOtpTimer={generateOtpTimer}
					onSkip={onSaveAndProceed}
					isDocumentUploadMandatory={isDocumentUploadMandatory}
				/>
			) : null}

			{isGeoTaggingEnabled &&
			cibilCheckbox &&
			declareCheck &&
			onsiteVerificationMsg &&
			!prompted &&
			!isAppCoAppVerificationComplete() &&
			((isEditLoan && isDraftLoan) || !isEditLoan) ? (
				<CompleteOnsiteVerificationModal onYes={closeVerificationMsgModal} />
			) : null}

			{/* {isGeoTaggingEnabled &&
			onsiteVerificationErr &&
			isMandatoryGeoVerificationComplete ? (
				<MandatoryOnsiteVerificationErrModal
					onYes={closeVerificationErrModal}
				/>
			) : null} */}

			{onSiteVerificationModal ? (
				<MandatoryOnsiteVerificationErrModal
					onYes={closeVerificationErrModal}
					errorImage={errorImage}
					errorText={
						'Geo-location not captured. Please capture before submitting the application!'
					}
				/>
			) : null}

			{totalMandatoryDocumentCount > 0 ? (
				<UI.CollapseHeader
					style={{
						marginBottom: 20,
						borderBottom: '3px solid #eee',
					}}
				>
					<UI.CategoryNameHeader>
						<span
							style={{
								color: 'red',
							}}
						>
							*
						</span>{' '}
						Mandatory
					</UI.CategoryNameHeader>
					{renderDocUploadedCount({
						uploaded: totalMandatoryUploadedDocumentCount,
						total: totalMandatoryDocumentCount,
					})}
				</UI.CollapseHeader>
			) : null}
			{CONST_SECTIONS.ALL_DOC_CATEGORY.map((category, categoryIndex) => {
				const selectedDocumentTypes =
					selectedDirectorDocumentTypes?.filter(
						docType => docType.category === category
					) || [];
				// console.log(
				// 	selectedDocumentTypes,
				// 	selectedDirectorDocumentTypes
				// );
				if (selectedDocumentTypes.length <= 0) return null;
				const selectedDocuments = selectedDirectorDocuments?.filter(
					doc => doc?.category === category
				);
				if (
					isEditLoan &&
					(category === CONST_SECTIONS.DOC_CATEGORY_LENDER ||
						category === CONST_SECTIONS.DOC_CATEGORY_EVAL)
				) {
					return null;
				}
				return (
					<div key={`data-${category}-{${selectedDirectorId}}`}>
						<UI.CollapseHeader onClick={() => toggleOpenSection(category)}>
							<UI.CategoryNameHeader>
								{category === CONST_SECTIONS.DOC_CATEGORY_EVAL
									? CONST_SECTIONS.DOC_CATEGORY_EVAL_NAME
									: category.toLocaleUpperCase()}{' '}
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
									directorId={selectedDirectorId}
								/>
							</UI.UploadWrapper>
						</UI.CollapseBody>
					</div>
				);
			})}

			<UI.Footer>
				{/* TODO: comment for office use  */}
				{selectedSection?.sub_sections?.map((sub_section, idx) => {
					return (
						<UI.CommentsForOfficeUserWrapper key={`sub-${sub_section?.id}`}>
							<UI.Divider />
							<UI.CommentsForOfficeUseFieldName>
								{/* {sub_section?.id === 'on_site_selfie_with_applicant'
									? isApplicant
										? sub_section?.name
										: Object.keys(nonApplicantDirectorsObject).length > 1
										? sub_section?.fields?.[1].label +
										  ` ${Object.keys(nonApplicantDirectorsObject).indexOf(
												selectedDirectorId
										  ) + 1}`
										: sub_section?.fields?.[1]?.label
									: sub_section?.name} */}
								{sub_section?.name?.includes('Selfie')
									? `${sub_section?.fields?.[0]?.label} ${
											!!selectedDirector?.type_name
												? selectedDirector?.type_name
												: 'Entity'
									  } ${getSelectedDirectorIndex({
											directors,
											selectedDirector,
									  })}`
									: sub_section?.name}

								{isCommentRequired && (
									<span
										style={{
											color: 'red',
										}}
									>
										*
									</span>
								)}
							</UI.CommentsForOfficeUseFieldName>
							{sub_section?.fields?.map((field, fieldIndex) => {
								// {selectedSection?.sub_sections?.[0]?.fields?.map(field => {
								if (!isFieldValid({ field, formState: {}, isApplicant })) {
									return null;
								}
								if (
									isGeoTaggingEnabled &&
									field?.type === 'file' &&
									field?.db_key === CONST.SELFIE_UPLOAD_FIELD_NAME
								) {
									return (
										<UI.VerificationSectionWrapper
											key={`dataitem-${field?.id}${fieldIndex}`}
										>
											{/* {console.log(selectedDirector.onSiteSelfieGeoLocation)} */}
											<UI.VerificationSection
												isLocation={
													// !!selectedDirector?.onSiteSelfieGeoLocation ||
													// !!entityGeolocation
													!!selectedDirector
														? !!selectedDirector?.onSiteSelfieGeoLocation
														: !!entityGeolocation
												}
											>
												<ProfileUpload
													field={field}
													isDisabled={isViewLoan}
													onChangeFormStateField={onChangeFormStateField}
													uploadedFile={
														cacheFile?.[selectedDirectorId]?.file ||
														selfieImageUploadedFile ||
														profileUploadedFile ||
														null
													}
													cacheDocumentsTemp={cacheDocumentsTemp}
													addCacheDocumentTemp={addCacheDocumentTemp}
													removeCacheDocumentTemp={removeCacheDocumentTemp}
													selectedDirector={selectedDirector}
													section={'documentUpload'}
												/>
											</UI.VerificationSection>
											{field?.geo_tagging === true
												? (Object.keys(
														selectedDirector?.onSiteSelfieGeoLocation || {}
												  ).length > 0 ||
														(selectedDirectorId === '0' &&
															Object.keys(entityGeolocation || {}).length >
																0)) && (
														<UI.VerificationSection
															isLocation={
																!!selectedDirector
																	? !!selectedDirector?.onSiteSelfieGeoLocation
																	: !!entityGeolocation
															}
														>
															<AddressDetailsCard
																address={
																	selectedDirectorId === '0'
																		? entityGeolocation?.address
																		: selectedDirector?.onSiteSelfieGeoLocation
																				?.address
																}
																latitude={
																	selectedDirectorId === '0'
																		? entityGeolocation?.lat
																		: selectedDirector?.onSiteSelfieGeoLocation
																				?.lat
																}
																longitude={
																	selectedDirectorId === '0'
																		? entityGeolocation?.long
																		: selectedDirector?.onSiteSelfieGeoLocation
																				?.long
																}
																timestamp={
																	selectedDirectorId === '0'
																		? entityGeolocation?.timestamp
																		: selectedDirector?.onSiteSelfieGeoLocation
																				?.timestamp
																}
																err={
																	selectedDirector?.onSiteSelfieGeoLocation
																		?.err || entityGeolocation?.err
																}
																showCloseIcon={false}
																customStyle={{
																	width: 'fit-content',
																	position: 'relative',
																	bottom: '-45%',
																	heigth: 'fit-content',
																	maxHeight: 'fit-content',
																}}
															/>
														</UI.VerificationSection>
												  )
												: null}
										</UI.VerificationSectionWrapper>
									);
								}
								if (field.type === 'textarea') {
									return (
										<Textarea
											key={`field-${field.name}`}
											{...field}
											value={commentsForOfficeUse}
											onChange={e => {
												dispatch(setCommentsForOfficeUse(e.target.value));
											}}
											loading={savingComments}
											disabled={savingComments || isViewLoan}
											floatingLabel={false}
										/>
									);
								}
								return null;
							})}
							<UI.Divider />
						</UI.CommentsForOfficeUserWrapper>
					);
				})}

				{!isViewLoan && (
					<Button
						name='Get Other Bank Statements'
						onClick={() => setIsOtherBankStatementModal(true)}
						customStyle={{
							width: 'auto',
							height: '45px',
						}}
					/>
				)}
				<UI.CheckboxWrapper>
					<CheckBox
						name={
							!selectedProduct?.product_details?.consent?.consent1 ? (
								<span>{CONST.textForCheckbox.grantCibilAcces}</span>
							) : isCorporate ? (
								<span>
									{/* {CONST.textForCheckbox.grantCibilAcces.replace(
										'CIBIL',
										'Bureau'
									)} */}
									{selectedProduct?.product_details?.consent?.consent1.replace(
										'CIBIL',
										'Bureau'
									)}
								</span>
							) : (
								<span>
									{selectedProduct?.product_details?.consent?.consent1}
								</span>
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
							!selectedProduct?.product_details?.consent?.consent2 ? (
								<>
									<span>{CONST.textForCheckbox.declaration}</span>
									<span>{CONST.getATag(selectedProduct)}</span>
									<span>{CONST.textForCheckbox.declaration2}</span>
								</>
							) : selectedProduct?.product_details?.terms_and_conditions_url ? (
								<>{CONST.getTermsAndConditon(selectedProduct)}</>
							) : (
								<span>{CONST.textForCheckbox.defaultDeclaration}</span>
							)
						}
						checked={declareCheck}
						disabled={isViewLoan}
						onChange={() => {
							setDeclareCheck(!declareCheck);
							selectedSection?.sub_sections?.filter(
								section => section?.id === CONST.SELFIE_UPLOAD_SECTION_ID
							)?.[0] && setOnsiteVerificationMsg(true);
						}}
						bg='blue'
					/>
				</UI.CheckboxWrapper>
				<UI.SubmitWrapper>
					{!isViewLoan && displayProceedButton}
				</UI.SubmitWrapper>
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
