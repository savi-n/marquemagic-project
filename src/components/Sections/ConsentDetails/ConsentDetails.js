import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import * as API from '_config/app.config';
import { setSelectedSectionId } from 'store/appSlice';
import { getApiErrorMessage } from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import { setCompletedApplicationSection } from 'store/applicationSlice';
import { scrollToTopRootElement } from 'utils/helper.js';
import Button from 'components/Button';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui.js';
import Table from './Table.js';
import { useEffect } from 'react';
import Loading from 'components/Loading/Loading.js';
// import data from './sampleData.js';

const ConsentDetails = props => {
	const { app, application } = useSelector(state => state);
	const {
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		selectedSection,
		isViewLoan,
		userToken,
		// isEditLoan,
		// isEditOrViewLoan,
		clientToken,
		selectedProduct,
	} = app;

	const { businessId, loanId, loanRefId } = application;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [consentDetails, setConsentDetails] = useState([]);

	const fetchConsentDetails = async () => {
		try {
			setLoading(true);
			const consentRes = await axios.post(
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
			);
			setConsentDetails(consentRes?.data?.response);
			setLoading(false);
		} catch (error) {
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
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		scrollToTopRootElement();
		fetchConsentDetails();
		//eslint-disable-next-line
	}, []);

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onSaveAndProceed = () => {
		dispatch(setCompletedApplicationSection(selectedSectionId));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	return (
		<UI_SECTIONS.Wrapper>
			{loading ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.[0]?.name ? (
						<UI_SECTIONS.SubSectionHeader
							style={{
								margin: '60px 0 20px 0',
							}}
						>
							{selectedSection?.sub_sections?.[0]?.name}
						</UI_SECTIONS.SubSectionHeader>
					) : null}

					{consentDetails?.map((tables, sectionIndex) => {
						return (
							<UI.TableWrapper key={`section-${sectionIndex}-${tables?.id}`}>
								{/* {Will change it later to something dynamic} */}
								{tables?.fields?.[0]?.data?.length >= 1 && (
									<UI.TableMainHeader>{tables?.name}</UI.TableMainHeader>
								)}
								{tables?.fields?.map((field, idx) => {
									return (
										field?.data?.length >= 1 && (
											<Table
												fetchConsentDetails={fetchConsentDetails}
												key={`table-${idx}`}
												application={application}
												headers={field?.headers || []}
												data={field?.data || []}
												loanId={loanId}
												token={clientToken}
												hasSeperator={idx < tables?.fields?.length - 1}
												section={tables?.name}
												buttonDisabled={isViewLoan}
												selectedProduct= {selectedProduct}
											/>
										)
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
								onClick={onSaveAndProceed}
							/>
						)}

						{isViewLoan && (
							<>
								<Button
									name='Previous'
									onClick={naviagteToPreviousSection}
									fill
								/>
							</>
						)}
						{isViewLoan && (
							<>
								<Button name='Next' onClick={naviagteToNextSection} fill />
							</>
						)}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default ConsentDetails;
