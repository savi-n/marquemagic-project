import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { SKIP_SECTION } from '_config/app.config';
import { getAllCompletedSections, isDirectorApplicant } from 'utils/formatData';

import Button from 'components/Button';

import { setSelectedSectionId } from 'store/appSlice';

import { setCompletedApplicationSection } from 'store/applicationSlice';
import { useState } from 'react';

const NavigateCTA = props => {
	const { previous = true, next = true, trackSkippedSection = true } = props;
	const {
		isViewLoan,
		nextSectionId,
		prevSectionId,
		selectedSection,
		selectedSectionId,
		selectedProduct,
	} = useSelector(state => state.app);
	const [loading, setLoading] = useState(false);
	const { application } = useSelector(state => state);
	const dispatch = useDispatch();

	const { loanId, businessId, directorId } = application;
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);

	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
		selectedSectionId,
		selectedDirector: selectedDirector,
		isApplicant,
	});

	const buttons = [];

	const onSkip = async () => {
		// TODO: varun add new directors.sections / applications.sections object here
		try {
			setLoading(true);
			if (
				!completedSections?.includes(selectedSectionId) &&
				trackSkippedSection
			) {
				const reqBody = {
					loan_id: loanId,
					business_id: businessId,
					section_id: selectedSectionId,
					director_id: directorId,
				};

				await axios.post(SKIP_SECTION, reqBody);
			}

			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (err) {
			console.error(err.message);
		} finally {
			setLoading(false);
		}
	};
	if (!isViewLoan && !!selectedSection?.is_skip) {
		buttons.push(<Button name='Skip' loading={loading} onClick={onSkip} />);
	}

	if (isViewLoan && previous) {
		buttons.push(
			<Button
				name='Previous'
				onClick={() => dispatch(setSelectedSectionId(prevSectionId))}
				fill
			/>
		);
	}

	if (isViewLoan && next) {
		buttons.push(
			<Button
				name='Next'
				onClick={() => dispatch(setSelectedSectionId(nextSectionId))}
				fill
			/>
		);
	}
	// if (!isViewLoan) return null;
	return (
		<>
			{buttons.map((item, index) => (
				<React.Fragment key={`${index}-data`}>{item}</React.Fragment>
			))}
		</>
	);
};

export default NavigateCTA;
