/* This file contains util function to formatLoanData which is used in HomeLoanDetails component */
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
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
	const { selectedApplicantCoApplicantId, applicant } = applicantCoApplicants;
	const { applicantId } = applicant;

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
	if (!isNaN(selectedApplicantCoApplicantId)) {
		reqBody.director_id = selectedApplicantCoApplicantId;
	}
	if (
		selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT &&
		applicantId
	) {
		reqBody.director_id = applicantId;
	}
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
