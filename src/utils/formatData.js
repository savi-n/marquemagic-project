/* This file contains util function to formatLoanData which is used in HomeLoanDetails component */
import _ from 'lodash';
import * as CONST_SECTIONS from 'components/Sections/const';
import { ORIGIN } from '_config/app.config';
import { isBusinessPan } from 'utils/helper';

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

export const formatSectionReqBody = data => {
	try {
		const {
			values,
			app,
			applicantCoApplicants,
			application,
			selectedLoanProductId,
		} = data;
		const { whiteLabelId, selectedProduct, selectedSection } = app;
		const { loanRefId, businessId, loanProductId, loanId } = application;
		const {
			selectedApplicantCoApplicantId,
			applicant,
			coApplicants,
			isApplicant,
		} = applicantCoApplicants;
		const selectedApplicant = isApplicant
			? applicant
			: coApplicants[selectedApplicantCoApplicantId] || {};
		const subSectionsData = {};
		selectedSection?.sub_sections?.map(sub_section => {
			const sectionBody = {};
			sub_section.fields.map(field => {
				if (!field.db_key || !field.name || values?.[field.name] === undefined)
					return null;
				sectionBody[field.db_key] =
					typeof values[field.name] === 'string'
						? values[field.name]?.trim()
						: values[field.name];
				return null;
			});
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

		if (selectedApplicant?.directorId) {
			reqBody.director_id = selectedApplicant?.directorId;
		}
		reqBody.is_applicant = isApplicant;
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
					name: 'Other Front Part',
				},
				{
					typeId: `${prefix}514`,
					value: `${prefix}514`,
					doc_type_id: `${prefix}514`,
					id: `${prefix}514`,
					name: 'Other Back Part',
				},
				{
					typeId: `${prefix}515`,
					value: `${prefix}515`,
					doc_type_id: `${prefix}515`,
					id: `${prefix}515`,
					name: 'Other Front and Back',
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

export const getApplicantCoApplicantSelectOptions = data => {
	const { applicantCoApplicants, isEditOrViewLoan } = data;
	const { applicant, coApplicants } = applicantCoApplicants;
	const options = [];
	let applicantName = `${applicant?.basic_details?.first_name} ${
		applicant?.basic_details?.last_name
	}`;
	if (isEditOrViewLoan) {
		applicantName = `${applicant?.dfirstname} ${applicant?.dlastname}`;
	}
	options.push({
		name: applicantName,
		value: applicant?.directorId,
	});
	Object.keys(coApplicants).map(directorId => {
		let coApplicantName = `${
			coApplicants?.[directorId]?.basic_details?.first_name
		} ${coApplicants?.[directorId]?.basic_details?.last_name}`;

		if (isEditOrViewLoan) {
			coApplicantName = `${coApplicants?.[directorId]?.dfirstname} ${
				coApplicants?.[directorId]?.dlastname
			}`;
		}
		options.push({
			name: coApplicantName,
			value: directorId,
		});
		return null;
	});
	return options;
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
		applicantCoApplicantSectionIds,
		selectedApplicant,
	} = data;
	const completedMenu = [];
	selectedProduct?.product_details?.sections?.map(section => {
		// editloan adding new coapplicant
		if (
			isEditLoan &&
			!editLoanDirectors.includes(`${selectedApplicant?.directorId}`) && // new director
			applicantCoApplicantSectionIds.includes(section?.id)
		) {
			if (
				Object.keys(
					coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
				).length > 0
			)
				completedMenu.push(section.id);
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
		if (isApplicant && Object.keys(applicant?.[section?.id] || {}).length > 0) {
			completedMenu.push(section.id);
		} else {
			if (
				Object.keys(
					coApplicants?.[selectedApplicantCoApplicantId]?.[section?.id] || {}
				).length > 0
			)
				completedMenu.push(section.id);
		}
		if (Object.keys(application?.sections?.[section.id] || {}).length > 0) {
			completedMenu.push(section.id);
		}
		return null;
		// -- create mode
	});
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
		errorMessage = 'Something went wrong, Try after sometimes!';
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

export const getEditLoanLoanDocuments = data => {
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

export const isFieldValid = data => {
	// should return only null
	const { field, isApplicant, formState } = data;
	if (!field.visibility || !field.name || !field.type) return false;
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

export const formatLoanDocuments = docs => {
	const newDocs = [];
	docs?.map(doc => {
		const newDoc = {
			...(doc?.loan_document_details?.[0] || {}),
			...doc,
			document_id: doc?.id,
			doc_type_id: doc.doctype,
			name: getDocumentNameFromLoanDocuments(doc),
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
