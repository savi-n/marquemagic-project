/* This file contains util function to formatLoanData which is used in HomeLoanDetails component */
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import { ORIGIN } from '_config/app.config';

const formaterHOF = (formData, fields, callback) => {
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
