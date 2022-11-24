export const getATag = selectedProduct => {
	return (
		<a
			href={selectedProduct?.termsandconditionsurl}
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

export const commentsForOfficeUseField = {
	name: 'first_name',
	placeholder: 'First Name',
	db_key: 'first_name',
	rules: {
		required: true,
	},
	mask: {
		alpha_char_only: true,
	},
	type: 'text',
	pre_data_disable: false,
	protected: false,
	visibility: true,
	default_value: '',
};
