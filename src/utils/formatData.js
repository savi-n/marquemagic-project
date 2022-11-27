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
				sectionBody[field.db_key] = values[field.name];
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
	const { selectedAddressProofId, prefix } = data;
	switch (selectedAddressProofId?.replaceAll(prefix, '')) {
		case CONST_SECTIONS.EXTRACTION_KEY_AADHAAR:
			return [
				{
					typeId: `${prefix}501`,
					value: `${prefix}501`,
					doc_type_id: `${prefix}501`,
					id: `${prefix}501`,
					name: 'Aadhaar Front Part',
				},
				{
					typeId: `${prefix}502`,
					value: `${prefix}502`,
					doc_type_id: `${prefix}502`,
					id: `${prefix}502`,
					name: 'Aadhaar Back Part',
				},
				{
					typeId: `${prefix}503`,
					value: `${prefix}503`,
					doc_type_id: `${prefix}503`,
					id: `${prefix}503`,
					name: 'Aadhaar Front and Back',
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
				},
				{
					typeId: `${prefix}505`,
					value: `${prefix}505`,
					doc_type_id: `${prefix}505`,
					id: `${prefix}505`,
					name: 'Voter Back Part',
				},
				{
					typeId: `${prefix}506`,
					value: `${prefix}506`,
					doc_type_id: `${prefix}506`,
					id: `${prefix}506`,
					name: 'Voter Front and Back ',
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
				},
				{
					typeId: `${prefix}508`,
					value: `${prefix}508`,
					doc_type_id: `${prefix}508`,
					id: `${prefix}508`,
					name: 'DL Back Part',
				},
				{
					typeId: `${prefix}509`,
					value: `${prefix}509`,
					doc_type_id: `${prefix}509`,
					id: `${prefix}509`,
					name: 'DL Front and Back',
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
				},
				{
					typeId: `${prefix}511`,
					value: `${prefix}511`,
					doc_type_id: `${prefix}511`,
					id: `${prefix}511`,
					name: 'Passport Back Part',
				},
				{
					typeId: `${prefix}512`,
					value: `${prefix}512`,
					doc_type_id: `${prefix}512`,
					id: `${prefix}512`,
					name: 'Passport Front and Back',
				},
			];
		// case CONST_SECTIONS.EXTRACTION_KEY_OTHERS:
		// 	return [
		// 		{
		// 			typeId: `${prefix}513`,
		// 			value: `${prefix}513`,
		// 			doc_type_id: `${prefix}513`,
		// 			id: `${prefix}513`,
		// 			name: 'Other Front Part',
		// 		},
		// 		{
		// 			typeId: `${prefix}514`,
		// 			value: `${prefix}514`,
		// 			doc_type_id: `${prefix}514`,
		// 			id: `${prefix}514`,
		// 			name: 'Other Back Part',
		// 		},
		// 		{
		// 			typeId: `${prefix}515`,
		// 			value: `${prefix}515`,
		// 			doc_type_id: `${prefix}515`,
		// 			id: `${prefix}515`,
		// 			name: 'Other Front and Back',
		// 		},
		// 	];
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

export const getApplicantCoApplicantSelectOptions = applicantCoApplicants => {
	const { applicant, coApplicants } = applicantCoApplicants;
	const options = [];
	options.push({
		name: `${applicant?.basic_details?.first_name} ${
			applicant?.basic_details?.last_name
		}`,
		value: applicant?.directorId,
	});
	Object.keys(coApplicants).map(directorId => {
		options.push({
			name: `${coApplicants?.[directorId]?.basic_details?.first_name} ${
				coApplicants?.[directorId]?.basic_details?.last_name
			}`,
			value: directorId,
		});
		return null;
	});
	return options;
};
