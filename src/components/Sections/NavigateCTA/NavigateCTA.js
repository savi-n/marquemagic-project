import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Button from 'components/Button';

import { setSelectedSectionId } from 'store/appSlice';

const NavigateCTA = props => {
	const { previous = true, next = true } = props;
	const {
		isViewLoan,
		nextSectionId,
		prevSectionId,
		selectedSection,
	} = useSelector(state => state.app);
	const dispatch = useDispatch();

	const onSkip = () => {
		// TODO: varun add new directors.sections / applications.sections object here
	};

	if (!isViewLoan) return null;
	return (
		<>
			{previous && (
				<Button
					name='Previous'
					onClick={() => dispatch(setSelectedSectionId(nextSectionId))}
					fill
				/>
			)}
			{next && (
				<Button
					name='Next'
					onClick={() => dispatch(setSelectedSectionId(prevSectionId))}
					fill
				/>
			)}
			{!isViewLoan && !!selectedSection?.is_skip ? (
				<Button name='Skip' onClick={onSkip} />
			) : null}
		</>
	);
};

export default NavigateCTA;
