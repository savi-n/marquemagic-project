import React, { useState } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { DDUPE_CHECK } from '_config/app.config';
import { isFieldValid } from 'utils/formatData';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import { useToasts } from '../Toast/ToastProvider';
// import SAMPLE_JSON from './customerdetailsformsample.json';

const CustomerDetailsFormModal = props => {
	const {
		show,
		onClose,
		setIsCustomerListModalOpen,
		product,
		redirectToProductPage,
		setCustomerList,
		setCustomerDetailsFormData,
	} = props;
	const { register, formState, handleSubmit } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
	const { addToast } = useToasts();

	const handleProceed = async () => {
		try {
			setFetchingCustomerDetails(true);

			const reqBody =
				{
					customer_type: formState?.values['customer_type'],
					pan_number: formState?.values['pan_number'],
					mobile_num: formState?.values['mobile_no'],
					dob: formState?.values['ddob'],
					businesstype: formState?.values['businesstype'],
				} || {};
			setCustomerDetailsFormData(formState?.values || {});
			const ddupeRes = await axios.post(DDUPE_CHECK, reqBody);
			// console.log('ddupeRes-', ddupeRes);
			if (ddupeRes?.data.message === 'No data found') {
				addToast({
					message:
						'No Customer data found, please press SKIP and proceed to enter details.',
					type: 'error',
				});

				return;
			}
			ddupeRes && setCustomerList(ddupeRes?.data?.data || []);
			setIsCustomerListModalOpen(true);
			onClose();
		} catch (e) {
		} finally {
			setFetchingCustomerDetails(false);
		}
	};

	return (
		<Modal
			show={show}
			onClose={onClose}
			width='50%'
			height='70%'
			customStyle={{
				padding: '40px',
			}}
		>
			<UI.ImgClose onClick={onClose} src={imgClose} alt='close' />
			<UI.ResponsiveWrapper>
				{/* {SAMPLE_JSON?.sub_sections?.map((sub_section, sectionIndex) => { */}
				{product?.customer_details?.sub_sections?.map(
					(sub_section, sectionIndex) => {
						return (
							<React.Fragment
								key={`section-${sectionIndex}-${sub_section?.id}`}
							>
								{sub_section?.name ? (
									<UI.CustomerDetailsFormModalHeader>
										{sub_section.name}
									</UI.CustomerDetailsFormModalHeader>
								) : null}
								<UI_SECTIONS.FormWrap>
									{sub_section?.fields?.map((field, fieldIndex) => {
										if (
											!isFieldValid({ field, isApplicant: true, formState })
										) {
											return null;
										}
										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${field.name}`}
												style={{ padding: '10px 0' }}
											>
												{register({
													...field,
													value: formState?.values?.[field.name] || '',
													visibility: 'visible',
												})}

												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
										);
									})}
								</UI_SECTIONS.FormWrap>
							</React.Fragment>
						);
					}
				)}

				<UI.CustomerDetailsFormModalFooter>
					{product?.customer_details?.is_skip && (
						<Button
							disabled={fetchingCustomerDetails}
							isLoader={fetchingCustomerDetails}
							onClick={redirectToProductPage}
							name='Skip'
						/>
					)}
					<Button
						disabled={fetchingCustomerDetails}
						isLoader={fetchingCustomerDetails}
						name='Proceed'
						onClick={handleSubmit(handleProceed)}
						fill
					/>
				</UI.CustomerDetailsFormModalFooter>
			</UI.ResponsiveWrapper>
		</Modal>
	);
};

export default CustomerDetailsFormModal;
