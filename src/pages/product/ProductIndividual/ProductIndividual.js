import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import ApplicantCoApplicantHeader from 'components/ApplicantCoApplicantHeader';
import SideNav from 'components/SideNav';
import BasicDetails from 'components/Sections/BasicDetails';
import AddressDetails from 'components/Sections/AddressDetails';
import EmploymentDetails from 'components/Sections/EmploymentDetails';
import LoanDetails from 'components/Sections/LoanDetails/LoanDetails';
import CollateralDetails from 'components/Sections/CollateralDetails';
import BankDetails from 'components/Sections/BankDetails';
import Button from 'components/Button';
import { useDispatch } from 'react-redux';
import { setSelectedSectionId } from 'store/appSlice';
import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
// import * as CONST from './const';
import * as UI from './ui';
import { sleep } from 'utils/helper';

const ProductIndividual = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedSectionId,
		applicantCoApplicantSectionIds,
		nextSectionId,
	} = app;
	const { selectedApplicantCoApplicantId } = applicantCoApplicants;
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	let SelectedComponent = BasicDetails;
	switch (selectedSectionId) {
		case 'loan_address_details': {
			SelectedComponent = AddressDetails;
			break;
		}
		case 'employment_details': {
			SelectedComponent = EmploymentDetails;
			break;
		}
		case 'loan_details': {
			SelectedComponent = LoanDetails;
			break;
		}
		case 'collateral_details': {
			SelectedComponent = CollateralDetails;
			break;
		}
		case 'bank_details': {
			SelectedComponent = BankDetails;
			break;
		}
		default:
			break;
	}

	// for reseting formstate
	useEffect(() => {
		setLoading(true);
		sleep(100).then(res => {
			setLoading(false);
		});
	}, [selectedSectionId, selectedApplicantCoApplicantId]);

	// useEffect(() => {
	// 	console.log('ProductIndividual-allStates-', {
	// 		app,
	// 		application,
	// 		applicantCoApplicants,
	// 	});
	// }, [app, application, applicantCoApplicants]);

	return (
		<UI.Wrapper>
			<SideNav />
			<UI.RightSectionWrapper>
				<UI.IconDottedRight src={iconDottedRight} alt='dot' />
				<UI.DynamicSectionWrapper>
					{applicantCoApplicantSectionIds?.includes(selectedSectionId) && (
						<ApplicantCoApplicantHeader />
					)}
					<UI.DynamicSubSectionWrapper>
						{loading ? <div /> : <SelectedComponent />}
					</UI.DynamicSubSectionWrapper>
					<Button
						name='Skip'
						onClick={() => dispatch(setSelectedSectionId(nextSectionId))}
					/>
				</UI.DynamicSectionWrapper>
			</UI.RightSectionWrapper>
		</UI.Wrapper>
	);
};

export default ProductIndividual;
