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
	const buttons = [];
	const onSkip = () => {
		// TODO: varun add new directors.sections / applications.sections object here
		dispatch(setSelectedSectionId(nextSectionId));
	};
	if (!isViewLoan && !!selectedSection?.is_skip) {
		buttons.push(<Button name='Skip' onClick={onSkip} />);
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
