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
