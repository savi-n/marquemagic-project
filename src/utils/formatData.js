/* This file contains util function to formatLoanData which is used in HomeLoanDetails component */
import _ from 'lodash';
import queryString from 'query-string';
import * as CONST_SECTIONS from 'components/Sections/const';
import { ORIGIN } from '_config/app.config';
import { isBusinessPan } from 'utils/helper';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';

export const businessTypeMaps = [
	[['private', 'pvt'], 4],
	[['public', 'pub'], 5],
	[['llp'], 3],
];

export const formaterHOF = (formData, fields, callback) => {
	let data = {};

	for (let { name, type } of fields) {
		data = { ...data, ...callback(name, formData, type) };
	}

	return data;
};

export const formatEmiData = (formData, fields) => {
	return formaterHOF(formData, fields, (name, formData) => ({
		[name]: formData[name],
		// [`${name}_bank`]: formData[`${name}_bank`],
	}));
};

export const formatLoanData = (formData, fields) => {
	return formaterHOF(formData, fields, (name, formData, type) => ({
		[name]:
			type === 'search'
				? formData[name].value || formData[name]
				: formData[name],
	}));
};

export const getSelectedField = data => {
	const { fieldName, selectedSection, isApplicant } = data;
	const selectedSubSectionFields = [];
	selectedSection?.sub_sections?.map(subSection => {
		subSection?.fields?.map(field => {
			if (field?.name === fieldName) {
				selectedSubSectionFields.push(field);
			}
			return null;
		});
		return null;
	});
	if (selectedSubSectionFields.length === 0) return null;
	if (selectedSubSectionFields.length === 1) return selectedSubSectionFields[0];
	if (selectedSubSectionFields.length > 1) {
		let filterField = selectedSubSectionFields[0];
		selectedSubSectionFields?.map(field => {
			if (isApplicant && field?.is_co_applicant === false) {
				filterField = field;
			} else if (field?.is_applicant === false && isApplicant === false) {
				filterField = field;
			}
			return null;
		});
		return filterField;
	}
};

export const getSelectedSubField = data => {
	const { fields, isApplicant } = data;
	if (fields?.length === 0) return null;
	if (fields?.length === 1) return fields?.[0];
	if (fields?.length > 1) {
		let filterField = fields[0];
		fields?.map(field => {
			if (isApplicant && field?.is_co_applicant === false) {
				filterField = field;
			} else if (field?.is_applicant === false && isApplicant === false) {
				filterField = field;
			}
			return null;
		});
		return filterField;
	}
};

export const formatGetSectionReqBody = data => {
	const { application, selectedDirector } = data;
	const { loanRefId, businessId, loanId } = application;
	const reqBody = {
		business_id: businessId,
		loan_ref_id: loanRefId,
		loan_id: loanId,
	};
	if (selectedDirector?.directorId) {
		reqBody.director_id = selectedDirector?.directorId;
	}
	return queryString.stringify(reqBody);
};

export const formatSectionReqBody = data => {
	try {
		const {
			values,
			app,
			selectedDirector,
			application,
			selectedLoanProductId,
		} = data;
		const { whiteLabelId, selectedProduct, selectedSection, permission } = app;
		const { loanRefId, businessId, loanProductId, loanId } = application;
		const subSectionsData = {};
		selectedSection?.sub_sections?.map(sub_section => {
			let sectionBody = {};
			sub_section.fields.map(field => {
				if (!field.db_key || !field.name || values?.[field.name] === undefined)
					return null;
				sectionBody[field.db_key] =
					typeof values[field.name] === 'string'
						? values[field.name]?.trim()
						: values[field.name];
				if (field.db_key === 'locality' && !sectionBody[field.db_key]) {
					sectionBody[field.db_key] = sessionStorage.getItem('locality') || '';
				}
				if (!!field.sub_fields) {
					field.sub_fields?.map(sub_field => {
						// console.log(sub_field.name, values[sub_field.name]);
						// console.log(sub_field.db_key);
						if (
							!sub_field.db_key ||
							!sub_field.name ||
							values?.[sub_field.name] === undefined
						)
							return null;
						sectionBody[sub_field.db_key] =
							typeof values[sub_field.name] === 'string'
								? values[sub_field.name]?.trim()
								: values[sub_field.name];
						return null;
					});
				}

				return null;
			});
			// console.log(sectionBody);
			// console.log(values, selectedSection, sectionBody);
			if (selectedSection.id === 'basic_details') {
				sectionBody = {
					...sectionBody,
					app_coordinates: values['app_coordinates'],
				};
			}

			// console.log(values, selectedSection, sectionBody);
			subSectionsData[sub_section.id] = sectionBody;
			return null;
		});

		const reqBody = {
			section_id: selectedSection?.id,
			white_label_id: whiteLabelId,
			product_id: selectedProduct?.id,
			loan_product_id: selectedLoanProductId || loanProductId,
			origin: ORIGIN,
			data: subSectionsData,
		};

		// STATIC DATA PRESENT IN ALL UPDATE REQBODY
		if (loanRefId) {
			reqBody.loan_ref_id = loanRefId;
		}
		if (loanId) {
			reqBody.loan_id = loanId;
		}
		if (businessId) {
			reqBody.business_id = businessId;
		}

		if (selectedDirector?.directorId) {
			reqBody.director_id = selectedDirector?.directorId;
		}
		if (isDirectorApplicant(selectedDirector)) {
			reqBody.is_applicant = true;
		}
		if (permission?.country) {
			reqBody.country = permission?.country;
		}
		if (selectedProduct?.parent_id) {
			reqBody.parent_product_id = selectedProduct?.parent_id;
		}
		// -- STATIC DATA PRESENT IN ALL UPDATE REQBODY

		// console.log('formatSectionReqBody-', { data, selectedApplicant });
		return reqBody;
	} catch (error) {
		console.error('error-formatSectionReqBody-', error);
	}
};

export const formatCompanyRocData = (data, panNum) => {
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
};

export const formatPanExtractionData = data => {
	const { panExtractionApiRes, isSelectedProductTypeBusiness } = data;
	const newPanExtractionData = _.cloneDeep(
		panExtractionApiRes?.data?.extractionData || {}
	);
	const panName =
		newPanExtractionData?.Name ||
		newPanExtractionData?.name ||
		newPanExtractionData?.father_name ||
		'';
	newPanExtractionData.doc_ref_id = panExtractionApiRes?.data?.doc_ref_id || '';
	newPanExtractionData.requestId = panExtractionApiRes?.data?.request_id || '';
	newPanExtractionData.panNumber = newPanExtractionData?.Pan_number || '';
	newPanExtractionData.responseId = newPanExtractionData?.id || '';
	newPanExtractionData.dob = newPanExtractionData?.DOB || '';
	newPanExtractionData.isBusinessPan = isBusinessPan(panName) || false;
	newPanExtractionData.companyName = panName;
	if (isSelectedProductTypeBusiness) {
		const name =
			newPanExtractionData?.name?.split(' ') ||
			newPanExtractionData?.Name?.split(' ');
		if (name) {
			newPanExtractionData.firstName = name[0];
			newPanExtractionData.lastName = name[1];
		}
	}
	return newPanExtractionData;
};

export const formatAddressProofDocTypeList = data => {
	const { selectedAddressProofId, prefix, aid } = data;
	switch (selectedAddressProofId?.replaceAll(prefix, '')) {
		case CONST_SECTIONS.EXTRACTION_KEY_AADHAAR:
			return [
				{
					typeId: `${prefix}501`,
					value: `${prefix}501`,
					doc_type_id: `${prefix}501`,
					id: `${prefix}501`,
					name: 'Aadhaar Front Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_AADHAAR,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
				},
				{
					typeId: `${prefix}502`,
					value: `${prefix}502`,
					doc_type_id: `${prefix}502`,
					id: `${prefix}502`,
					name: 'Aadhaar Back Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_AADHAAR,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_B,
				},
				{
					typeId: `${prefix}503`,
					value: `${prefix}503`,
					doc_type_id: `${prefix}503`,
					id: `${prefix}503`,
					name: 'Aadhaar Front and Back',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_AADHAAR,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_FB,
				},
			];
		case CONST_SECTIONS.EXTRACTION_KEY_VOTERID:
			return [
				{
					typeId: `${prefix}504`,
					value: `${prefix}504`,
					doc_type_id: `${prefix}504`,
					id: `${prefix}504`,
					name: 'Voter Front Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_VOTER,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
				},
				{
					typeId: `${prefix}505`,
					value: `${prefix}505`,
					doc_type_id: `${prefix}505`,
					id: `${prefix}505`,
					name: 'Voter Back Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_VOTER,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_B,
				},
				{
					typeId: `${prefix}506`,
					value: `${prefix}506`,
					doc_type_id: `${prefix}506`,
					id: `${prefix}506`,
					name: 'Voter Front and Back ',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_VOTER,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_FB,
				},
			];
		case CONST_SECTIONS.EXTRACTION_KEY_DL:
			return [
				{
					typeId: `${prefix}507`,
					value: `${prefix}507`,
					doc_type_id: `${prefix}507`,
					id: `${prefix}507`,
					name: 'DL Front Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_DL,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
				},
				{
					typeId: `${prefix}508`,
					value: `${prefix}508`,
					doc_type_id: `${prefix}508`,
					id: `${prefix}508`,
					name: 'DL Back Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_DL,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_B,
				},
				{
					typeId: `${prefix}509`,
					value: `${prefix}509`,
					doc_type_id: `${prefix}509`,
					id: `${prefix}509`,
					name: 'DL Front and Back',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_DL,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_FB,
				},
			];
		case CONST_SECTIONS.EXTRACTION_KEY_PASSPORT:
			return [
				{
					typeId: `${prefix}510`,
					value: `${prefix}510`,
					doc_type_id: `${prefix}510`,
					id: `${prefix}510`,
					name: 'Passport Front Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_PASSPORT,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
				},
				{
					typeId: `${prefix}511`,
					value: `${prefix}511`,
					doc_type_id: `${prefix}511`,
					id: `${prefix}511`,
					name: 'Passport Back Part',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_PASSPORT,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_B,
				},
				{
					typeId: `${prefix}512`,
					value: `${prefix}512`,
					doc_type_id: `${prefix}512`,
					id: `${prefix}512`,
					name: 'Passport Front and Back',
					aid,
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_PASSPORT,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_FB,
				},
			];
		case CONST_SECTIONS.EXTRACTION_KEY_OTHERS:
			return [
				{
					typeId: `${prefix}513`,
					value: `${prefix}513`,
					doc_type_id: `${prefix}513`,
					id: `${prefix}513`,
					name: 'Address Proof Document Front',
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_OTHERS,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
				},
				{
					typeId: `${prefix}514`,
					value: `${prefix}514`,
					doc_type_id: `${prefix}514`,
					id: `${prefix}514`,
					name: 'Address Proof Document Back',
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_OTHERS,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_B,
				},
				{
					typeId: `${prefix}515`,
					value: `${prefix}515`,
					doc_type_id: `${prefix}515`,
					id: `${prefix}515`,
					name: 'Address Proof Document Front and Back',
					classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_OTHERS,
					classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_FB,
				},
			];
		default:
			return [];
	}
};

export const formatCompanyDataGST = (data, panNum, gstNum) => {
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
};

export const getselectedDirectorOptions = data => {
	const { directors } = data;
	const options = [];
	Object.keys(directors).map(directorId => {
		const firstName =
			directors?.[directorId]?.basic_details?.first_name ||
			directors?.[directorId]?.dfirstname ||
			'';
		const lastName =
			directors?.[directorId]?.basic_details?.last_name ||
			directors?.[directorId]?.dlastname ||
			'';

		const coApplicantName = [firstName, lastName].join(' ');

		options.push({
			name: coApplicantName,
			value: directorId,
		});
		return null;
	});
	return options;
};

export const getAllCompletedSections = data => {
	const {
		application,
		selectedDirector,
		// addNewDirectorKey,
		directorSectionIds,
		selectedProduct,
		selectedSectionId,
	} = data;
	let completedSections = [];
	if (Array.isArray(application?.sections)) {
		completedSections = [...completedSections, ...application?.sections];
	}
	if (Array.isArray(selectedDirector?.sections)) {
		completedSections = [...completedSections, ...selectedDirector?.sections];
	}
	// // 'Entity'

	if (
		selectedProduct?.isSelectedProductTypeBusiness &&
		[
			CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID,
			CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID,
		].includes(selectedSectionId)
	) {
		completedSections = [...completedSections, ...(directorSectionIds || [])];
	}

	// if (
	// 	!addNewDirectorKey &&
	// 	!selectedDirector?.directorId &&
	// 	application?.sections?.includes(CONST_SECTIONS.BUSINESS_DETAILS_SECTION_ID)
	// ) {
	// 	completedSections = [...completedSections, ...(directorSectionIds || [])];
	// }
	return completedSections;
};

export const getCompletedSections = data => {
	const {
		selectedProduct,
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		application,
		isEditOrViewLoan,
		isEditLoan,
		editLoanDirectors,
		directorSectionIds,
		selectedApplicant,
		isDraftLoan,
	} = data;
	const completedMenu = [];
	const reduxCompletedMenu = [];
	!isDraftLoan &&
		selectedProduct?.product_details?.sections?.map(section => {
			// editloan adding new coapplicant
			if (
				isEditLoan &&
				!editLoanDirectors?.includes(`${selectedApplicant?.directorId}`) && // new director
				directorSectionIds?.includes(section?.id)
			) {
				if (
					Object.keys(
						coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
					).length > 0
				) {
					completedMenu.push(section.id);
					reduxCompletedMenu.push(section.id);
				}
				return null;
			}
			// -- editloan adding new coapplicant

			// editloan or view loan existing applicant-co-applicant and applicaiton sections
			if (isEditOrViewLoan) {
				completedMenu.push(section?.id);
				return null;
			}
			// -- editloan or view loan existing applicant-co-applicant and applicaiton sections

			// create mode
			if (
				isApplicant &&
				Object.keys(applicant?.[section?.id] || {}).length > 0
			) {
				completedMenu.push(section.id);
				reduxCompletedMenu.push(section.id);
			} else {
				if (
					Object.keys(
						coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
					).length > 0
				) {
					completedMenu.push(section.id);
					reduxCompletedMenu.push(section.id);
				}
			}
			if (Object.keys(application?.sections?.[section.id] || {}).length > 0) {
				completedMenu.push(section.id);
				reduxCompletedMenu.push(section.id);
			}
			return null;
			// -- create mode
		});

	isDraftLoan &&
		selectedProduct?.product_details?.sections?.map(section => {
			if (Object.keys(selectedApplicant?.[section.id] || {}).length > 0) {
				reduxCompletedMenu.push(section.id);
			}
			if (Object.keys(application?.sections?.[section.id] || {}).length > 0) {
				reduxCompletedMenu.push(section.id);
			}
			return null;
		});

	// console.log('formatData-getCompletedSections-', {
	// 	data,
	// 	completedMenu,
	// 	reduxCompletedMenu,
	// 	selectedApplicant,
	// });

	// draft mode remove all sections which are not exist in redux store
	if (isDraftLoan) {
		return reduxCompletedMenu;
	}
	return completedMenu;
};

export const getApiErrorMessage = error => {
	let errorMessage = '';
	if (typeof error?.response?.data === 'string') {
		errorMessage = error?.response?.data;
	} else if (typeof error?.response?.data?.message === 'string') {
		errorMessage = error?.response?.data?.message;
	} else if (typeof error?.response?.data?.details === 'string') {
		errorMessage = error?.response?.data?.details;
	} else if (typeof error?.response?.data?.cause?.details === 'string') {
		errorMessage = error?.response?.data?.cause?.details;
	} else {
		errorMessage = 'Something went wrong, Try after sometime!';
	}
	return errorMessage;
};

export const getDocumentCategoryName = type => {
	let category = '';
	if (type?.toLowerCase()?.includes(CONST_SECTIONS.DOC_CATEGORY_KYC))
		category = CONST_SECTIONS.DOC_CATEGORY_KYC;
	if (type?.toLowerCase()?.includes(CONST_SECTIONS.DOC_CATEGORY_FINANCIAL))
		category = CONST_SECTIONS.DOC_CATEGORY_FINANCIAL;
	if (type?.toLowerCase()?.includes(CONST_SECTIONS.DOC_CATEGORY_OTHER))
		category = CONST_SECTIONS.DOC_CATEGORY_OTHER;
	return category;
};

export const getEditLoanDocuments = data => {
	const { documents, directorId, docTypeId } = data;
	return documents?.filter(doc => {
		if (
			`${doc?.directorId}` === `${directorId}` &&
			`${doc?.doctype}` === `${docTypeId}`
		)
			return true;
		return false;
	});
};

export const parseJSON = data => {
	try {
		return JSON.parse(data);
	} catch (error) {
		console.error('error-parseJSON-', { error, data });
		return {};
	}
};

export const createIndexKeyObjectFromArrayOfObject = data => {
	const { arrayOfObject, isEmiDetails, isEditOrViewLoan } = data;
	const keysOfObject = {};
	arrayOfObject?.map((item, itemIndex) => {
		Object.keys(item || {}).map(itemKey => {
			if (isEmiDetails && itemKey === 'bank_name') {
				keysOfObject[`${itemKey}_${itemIndex}`] = item?.[itemKey]?.value;
			} else {
				keysOfObject[`${itemKey}_${itemIndex}`] = item?.[itemKey];
			}
			// edit loan overwrite bank name value with bank id
			if (isEditOrViewLoan && itemKey === 'bank_name') {
				keysOfObject[`${itemKey}_${itemIndex}`] = item?.bank_id;
			}
			return null;
		});
		return null;
	});
	return keysOfObject;
};

export const formatUploadCacheDocumentReqBody = data => {
	const { documents, application, directorId, selectedIncomeType } = data;
	const { loanId, businessUserId } = application;
	const reqBody = {
		loan_id: loanId,
		user_id: businessUserId,
		request_ids_obj: [],
	};
	documents?.map(doc => {
		if (!doc?.requestId) return null;
		reqBody.request_ids_obj.push({
			request_id: doc?.requestId,
			doc_type_id: doc?.field?.doc_type?.[selectedIncomeType], // pending
			is_delete_not_allowed: true,
			director_id: directorId,
		});
		return null;
	});
	return reqBody;
};

// TODO: Varun SME Flow move this logic inside register
export const isFieldValid = data => {
	// should return only null
	const { field, isApplicant, formState } = data;
	// if (!field?.visibility || !field?.name || !field?.type) return false;
	if (field?.visibility === false || !field?.name || !field?.type) return false;
	if (field?.hasOwnProperty('is_applicant')) {
		if (field.is_applicant === false && isApplicant) {
			return false;
		}
	}
	if (field?.hasOwnProperty('is_co_applicant')) {
		if (field.is_co_applicant === false && !isApplicant) {
			return false;
		}
	}
	if (field?.for_type_name) {
		if (!field?.for_type.includes(formState?.values?.[field?.for_type_name]))
			return false;
	}
	// ALL CHECK PASS SO RETURN VALID TRUE
	return true;
};

export const formatAadhaarOtpResponse = aadhaarOtpRes => {
	let newPrefillValues = {};
	if (aadhaarOtpRes) {
		const newAddress1 = [];
		if (aadhaarOtpRes?.data?.address?.house)
			newAddress1.push(aadhaarOtpRes?.data?.address?.house || '');
		if (aadhaarOtpRes?.data?.address?.street)
			newAddress1.push(aadhaarOtpRes?.data?.address?.street || '');
		if (aadhaarOtpRes?.data?.address?.loc)
			newAddress1.push(aadhaarOtpRes?.data?.address?.loc || '');
		if (aadhaarOtpRes?.data?.address?.vtc)
			newAddress1.push(aadhaarOtpRes?.data?.address?.vtc || '');
		if (aadhaarOtpRes?.data?.address?.subdist)
			newAddress1.push(aadhaarOtpRes?.data?.address?.subdist || '');
		newPrefillValues.address1 = newAddress1.join(', ');
		newPrefillValues.address2 = aadhaarOtpRes?.data?.address?.landmark || '';
		newPrefillValues.address3 = aadhaarOtpRes?.data?.address?.po || '';
		newPrefillValues.pinCode = aadhaarOtpRes?.data?.address?.pc || '';
		newPrefillValues.pin_code = aadhaarOtpRes?.data?.address?.pc || '';
		newPrefillValues.pincode = aadhaarOtpRes?.data?.address?.pc || '';
		newPrefillValues.city = aadhaarOtpRes?.data?.address?.dist || '';
		newPrefillValues.state = aadhaarOtpRes?.data?.address?.state || '';
		newPrefillValues.aadhaar = aadhaarOtpRes?.data?.adharNumber || '';
	}
	return newPrefillValues;
};

export const getDocumentNameFromLoanDocuments = doc => {
	return (
		doc?.uploaded_doc_name || doc?.original_doc_name || doc?.doc_name || ''
	);
};

export const getCategoryKeyFromCategoryName = doc => {
	let selectedCategory = CONST_SECTIONS.DOC_CATEGORY_OTHER;
	CONST_SECTIONS.ALL_DOC_CATEGORY.forEach(category => {
		if ((doc?.doc_type || doc?.category)?.toLowerCase()?.includes(category)) {
			selectedCategory = category;
		}
	});
	return selectedCategory;
};

export const formatLoanDocuments = data => {
	const { docs, docTypes } = data;
	const newDocs = [];
	docs?.map(doc => {
		const selectedDocType =
			docTypes.filter(docType => {
				if (
					`${docType.doc_type_id}` === `${doc.doctype}` ||
					`${docType.doc_type_id}` === `${doc.doc_type_id}`
				)
					return true;
				return false;
			})?.[0] || {};
		const newDoc = {
			...selectedDocType,
			...(doc?.loan_document_details?.[0] || {}),
			...(doc?.doc_type?.[0] || {}),
			...doc,
			document_key: doc?.document_key || doc?.doc_name,
			document_id: doc?.id,
			doc_type_id: doc.doctype || doc.doc_type.id,
			name: getDocumentNameFromLoanDocuments(doc),
			category: getCategoryKeyFromCategoryName(doc),
			directorId: `${doc?.directorId}`,
		};
		newDocs.push(newDoc);
		return null;
	});
	return newDocs;
};

// TODO: remove lender documents logics from document upload page
// and add it to app layout along with formatloandocument
export const formatLenderDocs = docs => {
	const newDocs = [];
	return newDocs;
};
// Special scenario - To check the completed sections for all the directors : used only on click of any of the sections in the side nav
export const validateAllDirectorSectionsCompleted = directors => {
	const incompleteDirectors = [];
	Object.values(directors)?.map(dir => {
		if (dir?.sections?.length < 3) {
			incompleteDirectors?.push(dir);
		}
		return null;
	});
	if (incompleteDirectors?.length > 0) {
		return {
			allowProceed: false,
			directorName: `${incompleteDirectors?.[0]?.type_name} ${
				incompleteDirectors?.[0]?.fullName
			}`,
		};
	}
	return { allowProceed: true };
};

// Validation for all the directors : This is the check before adding new director or moving to other sections from employment/basic/address details section
export const validateEmploymentDetails = data => {
	const { selectedDirector, directors } = data;
	let allowProceed = false;
	const lastDirector = Object.values(directors)?.pop();
	const restOfTheDirectors = Object.values(directors)?.slice(0, -1);

	if (
		Object.keys(directors)?.length === 1 &&
		selectedDirector?.sections?.length >= 2
	) {
		return { allowProceed: true };
	}
	if (Object.keys(directors)?.length > 1) {
		const notCompletedDirectors = [];

		restOfTheDirectors?.map(dir => {
			if (dir?.sections?.length < 3) {
				// console.log(dir?.sections, 'sections-dir');
				notCompletedDirectors.push(dir);
			}

			return null;
		});

		if (lastDirector?.sections?.length < 2)
			notCompletedDirectors.push(lastDirector);

		// special case when last director is submitted with basic and address sections.But the user tries to submit employment details from the first director
		if (
			lastDirector?.sections?.length === 2 &&
			+selectedDirector?.directorId !== +lastDirector?.directorId
		)
			notCompletedDirectors.push(lastDirector);

		if (notCompletedDirectors?.length === 0) allowProceed = true;

		return {
			allowProceed,
			// lastDirector,
			// restOfTheDirectors,
			// notCompletedDirectors,
			// selectedDirector,
			directorName:
				notCompletedDirectors?.length > 0
					? `${notCompletedDirectors?.[0]?.type_name} ${
							notCompletedDirectors?.[0]?.fullName
					  }`
					: null,
		};
	}
};
// Special case for SME Flow. Used only when clicked on any of the sections in the side nav.
export const validateDirectorForSme = directors => {
	if (
		!directors?.[+Object.keys(directors)?.[0]]?.sections ||
		directors?.[+Object.keys(directors)?.[0]]?.sections.length < 3
	)
		return { allowProceed: false };
	return { allowProceed: true };
};

export const checkInitialDirectorsUpdated = directors => {
	if (Object.keys(directors)?.length <= 1) return false;
	const restOfTheDirectors = Object.values(directors)?.slice(0, -1);
	const notCompletedDirectors = [];
	if (Object.keys(directors)?.length > 1) {
		restOfTheDirectors?.map(dir => {
			if (!dir?.sections || dir?.sections?.length < 3) {
				notCompletedDirectors.push(dir);
			}
			return null;
		});
		// console.log({ restOfTheDirectors, notCompletedDirectors });
	}
	if (notCompletedDirectors?.length > 0) return true;
	return false;
};

export const getApplicantNavigationDetails = data => {
	const { applicant, coApplicants, selectedApplicant } = data;

	const allApplicants = [`${applicant?.directorId}`];
	const allApplicantsObject = [applicant];

	const lastDirectorId =
		Object.keys(coApplicants || {})?.pop() || applicant?.directorId || '';

	const isLastApplicantIsSelected =
		`${lastDirectorId}` === `${selectedApplicant?.directorId}`;

	Object.keys(coApplicants || {})?.map(directorId => {
		allApplicants.push(directorId);
		allApplicantsObject.push(coApplicants[directorId]);
		return null;
	});
	let nextApplicantDirectorId = '';
	if (!isLastApplicantIsSelected) {
		const selectedApplicantIndex = allApplicants.findIndex(
			directorId => `${directorId}` === `${selectedApplicant?.directorId}`
		);
		nextApplicantDirectorId = allApplicants[selectedApplicantIndex + 1] || '';
	}

	let isEmploymentDetailsSubmited = false;
	if (
		Object.keys(
			selectedApplicant?.[CONST_SECTIONS.EMPLOYMENT_DETAILS_SECTION_ID] || {}
		)?.length > 0
	) {
		isEmploymentDetailsSubmited = true;
	}

	let lastIncompleteDirectorId = '';
	let lastIncompleteDirectorIndex = 0;
	allApplicantsObject.map((applicantObject, applicantObjectIndex) => {
		if (
			Object.keys(
				applicantObject?.[CONST_SECTIONS.EMPLOYMENT_DETAILS_SECTION_ID] || {}
			)?.length === 0 &&
			!lastIncompleteDirectorId
		) {
			lastIncompleteDirectorId = `${applicantObject?.directorId}`;
			lastIncompleteDirectorIndex = applicantObjectIndex;
		}
		return null;
	});

	const returnData = {
		allApplicants,
		nextApplicantDirectorId,
		lastDirectorId,
		isLastApplicantIsSelected,
		isEmploymentDetailsSubmited,
		lastIncompleteDirectorId,
		lastIncompleteDirectorIndex,
	};
	// console.log('getApplicantNavigationDetails-', { returnData });
	return returnData;
};

export const formatINR = value => {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
	}).format(value);
};

export const isDirectorApplicant = director => {
	return director?.type_name === 'Applicant';
	// item.type_name === 'Director' ||
	// item.type_name === 'Partner' ||
	// item.type_name === 'Member' ||
	// item.type_name === 'Proprietor'
};

export const getDirectorFullName = director => {
	const fullName = [];
	if (director.dfirstname) fullName.push(director.dfirstname);
	if (director.middle_name) fullName.push(director.middle_name);
	if (director.dlastname) fullName.push(director.dlastname);
	return fullName.join(' ');
};

export const getShortString = (str, max) => {
	if (str.length > max) {
		return str.slice(0, max) + '...';
	}
	return str;
};

export const formatAddressType = doc => {
	const prefix =
		`${doc?.document_details?.aid}` === '1'
			? CONST_ADDRESS_DETAILS.PREFIX_PRESENT
			: `${doc?.document_details?.aid}` === '2'
			? CONST_ADDRESS_DETAILS.PREFIX_PERMANENT
			: null;

	const valuesObj = {
		aadhaar: `${prefix}aadhar`,
		dl: `${prefix}DL`,
		voter: `${prefix}voter`,
		passport: `${prefix}passport`,
		others: `${prefix}others`,
	};
	const value = valuesObj?.[doc?.document_details?.classification_type];
	return `${value}`;
};

export const getSelectedDirectorIndex = data => {
	const { directors, selectedDirector } = data;
	let selectedDirectorIndex = 0;
	let totalCount = 0;
	Object.keys(directors || {})?.forEach(directorId => {
		if (directors?.[directorId]?.type_name === selectedDirector?.type_name) {
			totalCount++;
			if (directorId === selectedDirector?.directorId) {
				selectedDirectorIndex = totalCount;
			}
		}
	});
	const currentIndex =
		totalCount > 1 && selectedDirectorIndex > 0 ? selectedDirectorIndex : '';
	// console.log('getSelectedDirectorIndex-', {
	// 	directors,
	// 	selectedDirector,
	// 	selectedDirectorIndex,
	// 	totalCount,
	// 	currentIndex,
	// });
	return currentIndex;
};
