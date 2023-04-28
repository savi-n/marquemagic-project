import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import * as API from '_config/app.config';
import { toggleTestMode, setSelectedSectionId } from 'store/appSlice';
import { getApiErrorMessage } from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import { updateApplicationSection } from 'store/applicationSlice';
import Button from 'components/Button';
import Modal from 'components/Modal';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui.js';
import Table from './Table.js';
import { useEffect } from 'react';
import Loading from 'components/Loading/Loading.js';

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
		userToken,
		// isEditLoan,
		// isEditOrViewLoan,
	} = app;

	const { businessId, loanId, loanRefId } = application;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	const [consentDetails, setConsentDetails] = useState(null);

	const fetchConsentDetails = () => {
		setLoading(true);
		return axios
			.post(
				`${API.API_END_POINT}/api/consentDetails`,
				{
					business_id: businessId,
					loan_id: loanId,
					loan_ref_id: loanRefId,
				},
				{
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			)
			.then(consentRes => {
				setConsentDetails(consentRes?.data?.response);
				setLoading(false);
			})
			.catch(error => {
				console.error('error-ConsentDetails-getConsentDetails', {
					error: error,
					res: error?.response,
					resres: error?.response?.response,
					resData: error?.response?.data,
				});
				addToast({
					message: getApiErrorMessage(error),
					type: 'error',
				});
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchConsentDetails();
	}, []);

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

	// TODO:Implement fetch for every modal
	// const fetchHandle = async appObj => {
	// 	try {
	// 		appObj.status = 'fetched';
	// 		console.log(appObj);
	// 		setLoading(true);
	// 		const response = await axios.get(
	// 			`http://localhost:1337/equifax?aadhar_num=${appObj.Applicant}`
	// 		);
	// 		setHtmlContent(response.data);
	// 		setGstModalOpen(true);
	// 	} catch (error) {
	// 		console.error('error-ConsentDetails-fetchModal-', {
	// 			error: error,
	// 			res: error?.response,
	// 			resres: error?.response?.response,
	// 			resData: error?.response?.data,
	// 		});
	// 		addToast({
	// 			message: getApiErrorMessage(error),
	// 			type: 'error',
	// 		});
	// 		setGstModalOpen(false);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const onProceed = async () => {
	// 	try {
	// 		setLoading(true);
	// 	} catch (error) {
	// 		console.error('error-ConsentDetails-onProceed-', {
	// 			error: error,
	// 			res: error?.response,
	// 			resres: error?.response?.response,
	// 			resData: error?.response?.data,
	// 		});
	// 		addToast({
	// 			message: getApiErrorMessage(error),
	// 			type: 'error',
	// 		});
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return loading ? (
		<Loading />
	) : (
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
				<UI_SECTIONS.SubSectionHeader style={{ margin: '60px 0 20px 0' }}>
					{selectedSection?.sub_sections?.[0]?.name}
				</UI_SECTIONS.SubSectionHeader>
			) : null}

			{consentDetails?.map((tables, sectionIndex) => {
				return (
					<UI.TableWrapper key={`section-${sectionIndex}-${tables?.id}`}>
						{/* {Will change it later to something dynamic} */}
						{tables.fields[0].data.length >= 1 && (
							<UI.TableMainHeader>{tables?.name}</UI.TableMainHeader>
						)}
						{tables.fields.map((field, idx) => {
							return (
								<>
									{field.data.length >= 1 && (
										<Table
											headers={field.headers}
											data={field.data}
											// fetchHandle={fetchHandle}
											hasSeperator={idx < tables.fields.length - 1}
											buttonDisabled={isViewLoan}
										/>
									)}
								</>
							);
						})}
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
						onClick={onSkip}
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
				{/* <Button name='skip' onClick={onSkip} /> */}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default ConsentDetails;
