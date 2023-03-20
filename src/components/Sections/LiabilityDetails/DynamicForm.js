import React, { useEffect } from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
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
	const { isApplicant } = applicantCoApplicants;
	// const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	const onProceed = async () => {};

	const prefilledValues = field => {};

	// console.log('DynamicForms-allstates-', {
	// 	app,
	// 	selectedSection,
	// 	selectedLiabilityDetailsSubSection,
	// });

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
			<Button customStyle={{ maxWidth: 120 }}>Save</Button>
			<Button customStyle={{ maxWidth: 120, marginLeft: 20 }}>Delete</Button>
		</React.Fragment>
	);
};

export default DynamicForm;
