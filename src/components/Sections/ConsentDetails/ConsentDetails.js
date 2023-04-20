import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Button from 'components/Button';

import { toggleTestMode, setSelectedSectionId } from 'store/appSlice';

import { getApiErrorMessage } from 'utils/formatData';

import { useToasts } from 'components/Toast/ToastProvider';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui.js';
import { updateApplicationSection } from 'store/applicationSlice';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import Modal from 'components/Modal';

const ConsentDetails = props => {
	const { app, application } = useSelector(state => state);
	const {
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		selectedSection,
		isLocalhost,
		isViewLoan,
	} = app;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	const fetchHandle = () => {
		axios
			.get('http://localhost:1337/equifax')
			.then(response => {
				setHtmlContent(response.data);
			})
			.catch(error => {
				console.error(error);
			});
		setGstModalOpen(true);
	};
	const onProceed = async () => {
		try {
			setLoading(true);
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<UI_SECTIONS.Wrapper>
			<Modal
				show={isGstModalOpen}
				onClose={() => {
					setGstModalOpen(false);
				}}
				// Width='40%'
				customStyle={{
					width: '40%',
					minWidth: 'fit-content',
					minHeight: 'auto',
					position: 'relative',
					padding: '0',
				}}
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setGstModalOpen(false);
						}}
						style={{
							color: 'black',
							position: 'absolute',
							top: '0',
							right: '0',
							zIndex: '1',
							display: 'inline',
						}}
						src={imgClose}
						alt='close'
					/>
					<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</section>
			</Modal>
			{selectedSection?.sub_sections[0]?.name ? (
				<UI_SECTIONS.SubSectionHeader style={{ marginTop: '60px' }}>
					{selectedSection?.sub_sections?.[0]?.name}
				</UI_SECTIONS.SubSectionHeader>
			) : null}

			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<UI.TableWrapper key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name !== 'Help us with Consent Details' ? (
							<>
								<UI.TableMainHeader>{sub_section?.name}</UI.TableMainHeader>

								<UI.TableContainer>
									<UI.TableHeader>
										<UI.TableCell>Applicant Name</UI.TableCell>
										<UI.TableCell>Aadhar Number</UI.TableCell>
										<UI.TableCell>Status</UI.TableCell>
										<UI.TableCell />
									</UI.TableHeader>
									<UI.TableRow>
										<UI.TableCell>John Bijay Doe</UI.TableCell>
										<UI.TableCell>KDSJA7465ADS4</UI.TableCell>
										<UI.TableCell>ACTIVE</UI.TableCell>
										<UI.TableCell>
											<Button name='Fetch' onClick={fetchHandle} />
										</UI.TableCell>
									</UI.TableRow>
									<UI.TableRow>
										<UI.TableCell>John Kalia Kaliya Doe</UI.TableCell>
										<UI.TableCell>KDSJA7465AdsfsdDS4</UI.TableCell>
										<UI.TableCell>INACTIVE</UI.TableCell>
										<UI.TableCell>
											<Button name='Fetch' onClick={fetchHandle} />
										</UI.TableCell>
									</UI.TableRow>
								</UI.TableContainer>
							</>
						) : null}
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (!field.visibility || !field.name || !field.type)
									return null;

								const customFieldProps = {};

								if (isViewLoan) {
									customFieldProps.disabled = true;
								}

								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${fieldIndex}-${field.name}`}
									>
										{/* {hello} */}
									</UI_SECTIONS.FieldWrapGrid>
								);
							})}
						</UI_SECTIONS.FormWrapGrid>
					</UI.TableWrapper>
				);
			})}

			<UI_SECTIONS.Footer>
				{!isViewLoan && (
					<Button
						fill
						name={'Save and Proceed'}
						isLoader={loading}
						disabled={loading}
						onClick={onProceed}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
					</>
				)}
				{isLocalhost && !isViewLoan && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
				<Button name='skip' onClick={onSkip} />
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default ConsentDetails;
