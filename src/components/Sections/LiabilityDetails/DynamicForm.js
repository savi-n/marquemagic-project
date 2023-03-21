import React from 'react';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useSelector } from 'react-redux';
import {
	getApplicantCoApplicantSelectOptions,
	isFieldValid,
} from 'utils/formatData';
// import { API_END_POINT } from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
// import * as UI from './ui';
import * as CONST from './const';
import selectedSection from './sample.json'; // TODO: remove after testing

const DynamicForm = props => {
	const { fields } = props;
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const { isViewLoan, selectedSectionId, isTestMode, isEditLoan } = app;
	const { isApplicant } = applicantCoApplicants;
	// const dispatch = useDispatch();
	// const [loading, setLoading] = useState(false);
	const { register, formState, handleSubmit } = useForm();

	const prefilledEditOrViewLoanValues = field => {
		const preData = {};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			if (isViewLoan) {
				return prefilledEditOrViewLoanValues(field) || '';
			}

			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE
			if (
				Object.keys(application?.sections?.[selectedSectionId] || {}).length > 0
			) {
				// special scenario for bank name prefetch
				if (application?.sections?.[selectedSectionId]?.[field?.name]?.value) {
					return application?.sections?.[selectedSectionId]?.[field?.name]
						?.value;
				} else {
					// if (
					// 	!application?.sections?.[selectedSectionId]?.hasOwnProperty(
					// 		'isSkip'
					// 	)
					// ) {
					return application?.sections?.[selectedSectionId]?.[field?.name];
					// }
				}
			}

			let editViewLoanValue = '';

			if (isEditLoan) {
				editViewLoanValue = prefilledEditOrViewLoanValues(field);
			}

			if (editViewLoanValue) return editViewLoanValue;

			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	const onProceed = data => {
		console.log('onProceed-Date-', data);
	};

	console.log('DynamicForms-allstates-', {
		fields,
		app,
		selectedSection,
	});

	return (
		<React.Fragment>
			<UI_SECTIONS.FormWrapGrid>
				{fields?.map((field, fieldIndex) => {
					if (!isFieldValid({ field, formState, isApplicant })) {
						return null;
					}
					const customFieldProps = {};
					const newField = _.cloneDeep(field);
					if (newField.name === CONST.FIELD_NAME_LIABILITIES_FOR) {
						newField.options = getApplicantCoApplicantSelectOptions({
							applicantCoApplicants,
						});
					}
					return (
						<UI_SECTIONS.FieldWrapGrid>
							{register({
								...newField,
								value: prefilledValues(newField),
								...customFieldProps,
								visibility: 'visible',
							})}
							{(formState?.submit?.isSubmited ||
								formState?.touched?.[newField.name]) &&
								formState?.error?.[newField.name] && (
									<UI_SECTIONS.ErrorMessage>
										{formState?.error?.[newField.name]}
									</UI_SECTIONS.ErrorMessage>
								)}
						</UI_SECTIONS.FieldWrapGrid>
					);
				})}
			</UI_SECTIONS.FormWrapGrid>
			<Button customStyle={{ maxWidth: 120 }} onClick={handleSubmit(onProceed)}>
				Save
			</Button>
			<Button customStyle={{ maxWidth: 120, marginLeft: 20 }}>Delete</Button>
		</React.Fragment>
	);
};

export default DynamicForm;
