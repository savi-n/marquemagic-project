import React from 'react';
import { useSelector } from 'react-redux';

import * as UI_SECTIONS from 'components/Sections/ui';

const DynamicForm = ({
	field,
	formState,
	register,
	customFieldProps,
	customFieldPropsSubFields,
	newValue,
	newValueSelectField,
}) => {
	const { userDetails } = useSelector(state => state.app);
	const notAllowedUsers = field?.field_not_allowed_for_users;

	if (
		notAllowedUsers &&
		(notAllowedUsers.includes(userDetails?.usertype) ||
			notAllowedUsers.includes(userDetails?.user_sub_type))
	) {
		return null;
	}
	if (field?.for_type_name) {
		if (!field?.for_type?.includes(formState?.values?.[field?.for_type_name]))
			return null;
	}

	return (
		<UI_SECTIONS.FieldWrapGrid>
			<div
				style={{
					display: 'flex',
					gap: '10px',
					alignItems: 'center',
				}}
			>
				{field?.sub_fields &&
					field?.sub_fields[0].is_prefix &&
					register({
						...field.sub_fields[0],
						value: newValueSelectField,
						visibility: 'visible',
						...customFieldProps,
						...customFieldPropsSubFields,
					})}
				<div
					style={{
						width: '100%',
					}}
				>
					{register({
						...field,
						value: newValue,
						visibility: 'visible',
						...customFieldProps,
					})}
				</div>
				{field?.sub_fields &&
					!field?.sub_fields[0].is_prefix &&
					register({
						...field.sub_fields[0],
						value: newValueSelectField,
						visibility: 'visible',
						...customFieldProps,
						...customFieldPropsSubFields,
					})}
			</div>
			{(formState?.submit?.isSubmited || formState?.touched?.[field?.name]) &&
				formState?.error?.[field?.name] && (
					<UI_SECTIONS.ErrorMessage>
						{formState?.error?.[field?.name]}
					</UI_SECTIONS.ErrorMessage>
				)}
			{(formState?.submit?.isSubmited ||
				formState?.touched?.[field?.sub_fields?.[0]?.name]) &&
				formState?.error?.[field?.sub_fields?.[0]?.name] && (
					<UI_SECTIONS.ErrorMessage>
						{formState?.error?.[field?.sub_fields[0]?.name]}
					</UI_SECTIONS.ErrorMessage>
				)}
		</UI_SECTIONS.FieldWrapGrid>
		//end
	);
};

export default DynamicForm;
