import { useSelector, useDispatch } from 'react-redux';
import Button from 'components/Button';
import { setSelectedSectionId } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';

const SkipComponent = () => {
	const { app } = useSelector(state => state);
	const dispatch = useDispatch();
	const { nextSectionId, selectedSectionId } = app;
	return (
		<div
			style={{
				height: '100vh',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Button
				customStyle={{ height: '50px' }}
				name='Skip'
				onClick={() => {
					dispatch(
						updateApplicationSection({
							sectionId: selectedSectionId,
							sectionValues: { isSkip: true },
						})
					);
					dispatch(setSelectedSectionId(nextSectionId));
				}}
			/>
		</div>
	);
};

export default SkipComponent;
