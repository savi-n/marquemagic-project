import React, { useState } from 'react';
import axios from 'axios';

import Button from 'components/Button';
import Modal from 'components/Modal';
import useForm from 'hooks/useFormIndividual';

import { DDUPE_CHECK } from '_config/app.config';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import SAMPLE_JSON from './customerdetailsformsample.json';

const CustomerDetailsFormModal = props => {
	const {
		show,
		onClose,
		setIsCustomerListModalOpen,
		product,
		redirectToProductPage,
		setCustomerList,
	} = props;
	const { register, formState, handleSubmit } = useForm();
	const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);

	const handleProceed = async () => {
		try {
			setFetchingCustomerDetails(true);

			const reqBody = {
				// custumer_id: 'Nc777',
				...(formState?.values || {}),
			};

			const ddupeRes = await axios.post(DDUPE_CHECK, reqBody);
			console.log('ddupeRes-', ddupeRes);
			setCustomerList(ddupeRes?.data?.data || {});
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
				{/* {product?.customer_details?.sub_sections?.map( */}
				{SAMPLE_JSON?.sub_sections?.map((sub_section, sectionIndex) => {
					return (
						<React.Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
							{sub_section?.name ? (
								<UI.CustomerDetailsFormModalHeader>
									{sub_section.name}
								</UI.CustomerDetailsFormModalHeader>
							) : null}
							<UI_SECTIONS.FormWrap>
								{sub_section?.fields?.map((field, fieldIndex) => {
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
				})}

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
