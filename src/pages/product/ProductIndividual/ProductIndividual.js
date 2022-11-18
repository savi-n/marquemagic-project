import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import AppCoAppHeader from 'components/AppCoAppHeader';
import SideNav from 'components/SideNav';
import BasicDetails from 'components/Sections/BasicDetails';
import AddressDetails from 'components/Sections/AddressDetails';
import EmploymentDetails from 'components/Sections/EmploymentDetails';

import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
// import * as CONST from './const';
import * as UI from './ui';
import { sleep } from 'utils/helper';

const ProductIndividual = props => {
	const { app, applicantCoApplicants } = useSelector(state => state);
	const { selectedSectionId, applicantCoApplicantSectionIds } = app;
	const { selectedApplicantCoApplicantId } = applicantCoApplicants;
	const [loading, setLoading] = useState(false);

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
	// 		applicantCoApplicants,
	// 	});
	// }, [selectedProduct, app, applicantCoApplicants]);

	return (
		<UI.Wrapper>
			<SideNav />
			<UI.RightSectionWrapper>
				<UI.IconDottedRight src={iconDottedRight} alt='dot' />
				<UI.DynamicSectionWrapper>
					{applicantCoApplicantSectionIds?.includes(selectedSectionId) && (
						<AppCoAppHeader />
					)}
					<UI.DynamicSubSectionWrapper>
						{loading ? <div /> : <SelectedComponent />}
					</UI.DynamicSubSectionWrapper>
				</UI.DynamicSectionWrapper>
			</UI.RightSectionWrapper>
		</UI.Wrapper>
	);
};

export default ProductIndividual;
