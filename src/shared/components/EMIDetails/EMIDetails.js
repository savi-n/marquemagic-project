import styled from 'styled-components';
import { array, func, object, oneOfType } from 'prop-types';

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrap = styled.div`
	width: 100%;
	margin: 10px 0;
	display: flex;
	/* gap: 10%; */
	@media(max-width: 700px){
	display: block;


	}
`;

const FormWrap = styled.div`
	display: flex;

	align-items: center;
	flex-wrap: wrap;
	width: 100%;

	gap: 10%;
	margin: 20px 0;

`;

const ErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
`;

const Currency = styled.div`
	width: 10%;
	font-size: 13px;
	font-weight: 500;
	display: flex;
	align-items: center;
	padding: 0 5px;
`;

const Field = styled.div`
	width: 40%;
	@media (max-width: 700px){
		margin: 5px 0;
	}
`;

EMIDetails.propTypes = {
	register: func.isRequired,
	jsonData: oneOfType([array, object]),
	formState: object,
};

export default function EMIDetails({
	jsonData,
	register,
	formState,
	label,
	userType,
	preData = {},
}) {
	const populateValue = field => {
		if (!userType && field.disabled) {
			return preData?.[field.name] || '';
		}

		if (formState?.values?.[field.name] !== undefined) {
			return formState?.values?.[field.name];
		}
		return preData?.[field.name] || field.value || '';
	};

	const populateValueBank = field => {
		if (!userType && field.disabled) {
			return preData?.[`${field.name}_bank_id`] || '';
		}

		if (
			formState?.values?.[`${field.name}_bank_id`] !== undefined &&
			formState?.values?.[`${field.name}_bank_id`] !== null
		) {
			return formState?.values?.[`${field.name}_bank_id`];
		}
		return preData?.[`${field.name}_bank_id`] || field.value || '';
	};
	return (
		<>
			<H>{label}</H>
			<FormWrap>
				{jsonData &&
					jsonData.map(
						field =>
							field.visibility && (
								<FieldWrap key={field.name}>
									<Field>
										{register({
											...field,
											// value: formState?.values?.[field.name],
											value: populateValue(field),
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<ErrorMessage>
													{formState?.error?.[field.name]}
												</ErrorMessage>
											)}
									</Field>
									<Currency />
									{/* {field.inrupees && (
										<Currency>{field.inrupees ? '(In  ₹ )' : ''}</Currency>
									)} */}
									<Field>
										{/* {register({
                      type: "banklist",
                      name: `${field.name}_bank_name`,
                      placeholder: "Select Bank",
                      value: formState?.values?.[`${field.name}_bank_name`],
                    })} */}
										{register({
											name: `${field.name}_bank_id`,
											placeholder:
												preData?.[`${field.name}_bank_name`] || 'Select Bank',
											type: 'banklist',
											value: populateValueBank(field),
										})}
									</Field>
									{/* rules: { required: !!formState?.values?.[field.name] }, */}
									{/* {(formState?.submit?.isSubmited ||
                    formState?.touched?.[`${field.name}_bank`]) &&
                    formState?.error?.[`${field.name}_bank`] && (
                      <ErrorMessage>
                        {formState?.error?.[`${field.name}_bank`]}
                      </ErrorMessage>
                    )} */}
								</FieldWrap>
							)
					)}
			</FormWrap>
		</>
	);
}
