/* This file contains util function to formatLoanData which is used in HomeLoanDetails component */
import * as CONST_SECTIONS from 'components/Sections/const';
import { ORIGIN } from '_config/app.config';

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
	const { section, values, app, applicantCoApplicants, application } = data;
	const { whiteLabelId, selectedProduct } = app;
	const { loanRefId, loanId, businessId } = application;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		isApplicant,
	} = applicantCoApplicants;

	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId];

	const subSectionsData = {};
	section.sub_sections.map(sub_section => {
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
		section_id: section.id,
		white_label_id: whiteLabelId,
		product_id: selectedProduct.id,
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

	// if (employmentId) {
	// 	reqBody.employment_id = employmentId;
	// }

	return reqBody;
};

export const formatCompanyData = (data, panNum) => {
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

export const formatAddressProofDocTypeList = data => {
	const { selectedAddressProofId } = data;
	switch (selectedAddressProofId) {
		case [CONST_SECTIONS.EXTRACTION_KEY_AADHAAR]:
			return [
				{
					typeId: 501,
					value: 501,
					doc_type_id: 501,
					id: 501,
					name: 'Aadhaar Front Part',
				},
				{
					typeId: 502,
					value: 502,
					doc_type_id: 502,
					id: 502,
					name: 'Aadhaar Back Part',
				},
				{
					typeId: 503,
					value: 503,
					doc_type_id: 503,
					id: 503,
					name: 'Aadhaar Front and Back',
				},
			];
		case [CONST_SECTIONS.EXTRACTION_KEY_VOTERID]:
			return [
				{
					typeId: 504,
					value: 504,
					doc_type_id: 504,
					id: 504,
					name: 'Voter Front Part',
				},
				{
					typeId: 505,
					value: 505,
					doc_type_id: 505,
					id: 505,
					name: 'Voter Back Part',
				},
				{
					typeId: 506,
					value: 506,
					doc_type_id: 506,
					id: 506,
					name: 'Voter Front and Back ',
				},
			];
		case [CONST_SECTIONS.EXTRACTION_KEY_DL]:
			return [
				{
					typeId: 507,
					value: 507,
					doc_type_id: 507,
					id: 507,
					name: 'DL Front Part',
				},
				{
					typeId: 508,
					value: 508,
					doc_type_id: 508,
					id: 508,
					name: 'DL Back Part',
				},
				{
					typeId: 509,
					value: 509,
					doc_type_id: 509,
					id: 509,
					name: 'DL Front and Back',
				},
			];
		case [CONST_SECTIONS.EXTRACTION_KEY_PASSPORT]:
			return [
				{
					typeId: 510,
					value: 510,
					doc_type_id: 510,
					id: 510,
					name: 'Passport Front Part',
				},
				{
					typeId: 511,
					value: 511,
					doc_type_id: 511,
					id: 511,
					name: 'Passport Back Part',
				},
				{
					typeId: 512,
					value: 512,
					doc_type_id: 512,
					id: 512,
					name: 'Passport Front and Back',
				},
			];
		// case [CONST_SECTIONS.EXTRACTION_KEY_OTHERS]:
		// 	return [
		// 		{
		// 			typeId: 513,
		// 			value: 513,
		// 			doc_type_id: 513,
		// 			id: 513,
		// 			name: 'Other Front Part',
		// 		},
		// 		{
		// 			typeId: 514,
		// 			value: 514,
		// 			doc_type_id: 514,
		// 			id: 514,
		// 			name: 'Other Back Part',
		// 		},
		// 		{
		// 			typeId: 515,
		// 			value: 515,
		// 			doc_type_id: 515,
		// 			id: 515,
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
