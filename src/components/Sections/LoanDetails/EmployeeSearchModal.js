import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
// import * as UI from './ui';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import Button from '../../Button';
import axios from 'axios';
import * as API from '_config/app.config';
import useForm from 'hooks/useFormIndividual';
import * as UI from './ui';
import * as UI_SECTIONS from 'components/Sections/ui';
import { isFieldValid } from 'utils/formatData';
import _, { add, fromPairs } from 'lodash';
import { getApiErrorMessage } from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';

const sub_section = {
	fields: [
		{
			name: 'employee_search',
			db_key: 'employee_search',
			placeholder: 'Employee ID',
			rules: {
				required: true,
			},
			type: 'text',
			sub_fields: [
				{
					name: 'emp_search',
					is_co_applicant: false,
					placeholder: 'Search',
					type: 'button',
					rules: {
						required: true,
					},
					isbuttonfilled: false,
				},
			],
			visibility: true,
		},
		{
			name: 'user_list',
			db_key: 'user_list',
			placeholder: 'User List',
			options: [],
			type: 'select',
			visibility: true,
		},
	],
};

const Header = styled.div`
	/* display: flex; */
	margin: 10px 0;
	font-size: 18px;
	font-weight: 600;
	padding: 0px 10px 10px;
	text-align: center;
`;

export default function EmployeeSearchModal({
	show,
	onClose,
	populateEmployeeId,
	loanOrigin,
	selectedIdField,
}) {
	const { addToast } = useToasts();
	const [userList, setUserList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		selectedSearchField,
	} = useForm();

	const handleEmployeSearch = async () => {
		let emp_id = formState?.values?.['employee_search'];
		try {
			setIsLoading(true);
			const res = await axios.get(
				`${API.EMPLOYEE_SEARCH}?loan_origin=${loanOrigin}&employee_id=${emp_id}`
			);
			if (res?.data?.status === 'ok') {
				if (res?.data?.data?.length > 0) {
					const firstItem =
						emp_id === '' ? res?.data?.data?.[1] : res?.data?.data?.[0];

					let empList = [];

					if (firstItem?.employeeid || firstItem?.employee_id) {
						empList = res?.data?.data?.map(item => ({
							name: item?.name + '-' + (item?.employeeid || item?.employee_id),
							value: item?.employeeid || item?.employee_id,
						}));
					} else if (firstItem?.partner_data && firstItem?.dsa_id) {
						empList = res?.data?.data?.map(item => ({
							name: item?.partner_data + '-' + item?.dsa_id,
							value: item?.dsa_id,
						}));
					}
					setUserList(empList);
				} else {
					return addToast({
						message: 'No user found for the searched Employee Id',
						type: 'error',
					});
				}
			}
		} catch (error) {
			console.error('error-EmployeeSearch', {
				error: error,
				res: error?.response?.data || '',
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDataPopulate = () => {
		try {
			let selectedEmployeeId = formState?.values?.['user_list'];

			if (!selectedEmployeeId)
				return addToast({
					message: 'Please select employee from the list',
					type: 'error',
				});

			populateEmployeeId(selectedIdField, selectedEmployeeId);
			clearList();
		} catch (error) {
			console.error(error, 'error in populating employee id');
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		}
	};

	const clearList = () => {
		setUserList([]);
		onClose();
	};

	return (
		<>
			<Modal
				show={show}
				onClose={clearList}
				customStyle={{
					padding: '40px',
				}}
			>
				<UI.ImgClose onClick={clearList} src={imgClose} alt='close' />
				<UI.ResponsiveWrapper>
					<Header>Employee Id Search</Header>
					<UI_SECTIONS.FormWrap>
						{sub_section?.fields?.map((field, fieldIndex) => {
							const newField = _.cloneDeep(field);
							const customFieldProps = {};
							const customFieldPropsSubfields = {};

							// const newValue = prefilledValues(field);

							if (field?.name === 'user_list') {
								customFieldProps.options = userList;
							}
							if (isLoading) customFieldProps.disabled = isLoading;

							return (
								<UI_SECTIONS.FieldWrapGrid
									key={`field-${fieldIndex}-${newField.name}`}
								>
									<div
										style={{
											display: 'flex',
											gap: '10px',
											alignItems: 'center',
											margin: '10px',
										}}
									>
										<div
											style={{
												width: '100%',
											}}
										>
											{register({
												...newField,
												value: formState?.values?.[field.name],
												//  || newValue,
												...customFieldProps,
												visibility: 'visible',
											})}
										</div>
										{field?.sub_fields?.map(subField => {
											if (subField?.name === 'emp_search') {
												customFieldPropsSubfields.onClick = () => {
													handleEmployeSearch();
												};
												customFieldPropsSubfields.disabled = isLoading;
												customFieldPropsSubfields.loading = isLoading;
											}

											return (
												!subField?.is_prefix &&
												register({
													...subField,
													value: '',
													visibility: 'visible',
													...customFieldProps,
													...customFieldPropsSubfields,
												})
											);
										})}
									</div>
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
					</UI_SECTIONS.FormWrap>
					{/* </React.Fragment>
						);
					})} */}
					<UI.CustomerDetailsFormModalFooter>
						<Button
							disabled={isLoading || userList?.length === 0}
							// isLoader={isLoading}
							name='Proceed'
							onClick={() => handleDataPopulate()}
							fill
						/>
					</UI.CustomerDetailsFormModalFooter>
				</UI.ResponsiveWrapper>
			</Modal>
		</>
	);
}
