export const getATag = selectedProduct => {
	return (
		<a
			href={selectedProduct?.product_details?.terms_and_conditions_url}
			rel='noreferrer'
			target={'_blank'}
			style={{ color: 'blue' }}
		>
			Terms and Conditions
		</a>
	);
};

export const getTermsAndConditon = selectedProduct => {
	const TermsAndConditionsTextParts = selectedProduct?.product_details?.consent?.consent2.split(
		'Terms and Conditions'
	);
	return (
		<>
			<span>{TermsAndConditionsTextParts?.[0]}</span>
			<span>{getATag(selectedProduct)}</span>
			<span>{TermsAndConditionsTextParts?.[1]}</span>
		</>
	);
};

export const IS_CONSENT_MANDATORY = selectedProduct => {
	const configConsent = selectedProduct?.product_details?.is_consent_mandatory;
	// if is_consent_mandatory is present in product_details, then take the value which is there(either true or false) or else always set is_consent_mandatory to true, for checkbox and submittion
	let is_consent_mandatory =
		configConsent === true || configConsent === false ? configConsent : true;
	// if (`${selectedProduct?.product_details?.is_consent_mandatory}` === 'false') {
	// 	is_consent_mandatory = false;
	// }
	return is_consent_mandatory;
};

export const textForCheckbox = {
	grantCibilAcces: 'I here by give consent to pull my CIBIL records',
	declaration: 'I have read the ',
	declaration2: ' and I agree to the same.',
	defaultDeclaration:
		'I here do declare that what is stated above is true to the best of my knowledge and  belief',
};
export const COMMENT_FOR_OFFICE_USE_FIELD_NAME = 'comment_for_office_use';

export const DOCUMENT_UPLOAD_SECTION_ID = 'document_upload';
export const PROFILE_UPLOAD_FIELD_NAME = 'profile_upload';
export const SELFIE_UPLOAD_FIELD_NAME = 'on_site_selfie';
export const SELFIE_UPLOAD_SECTION_ID = 'on_site_selfie_with_applicant';
export const SELFIE_UPLOAD_COAPPLICANT_SECTION_ID =
	'on_site_selfie_with_co_applicant';

export const ON_SITE_SELFIE_UPLOAD_FIELD_NAME_APPLICANT =
	'on_site_selfie_with_applicant';
export const ON_SITE_SELFIE_UPLOAD_FIELD_NAME_COAPPLICANT =
	'on_site_selfie_with_co_applicant';

export const DEFAULT_DIRECTOR_ID_FOR_ENTITY = '0';
