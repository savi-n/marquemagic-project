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
import DocumentUpload from 'components/Sections/DocumentUpload';
import ReferenceDetails from 'components/Sections/ReferenceDetails';
import EMIDetails from 'components/Sections/EMIDetails';
import ApplicationSubmitted from 'components/Sections/ApplicationSubmitted';

import { useDispatch } from 'react-redux';
import Button from 'components/Button';
import { setSelectedSectionId } from 'store/appSlice';
import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
// import * as CONST from './const';
import * as UI from './ui';
import { sleep } from 'utils/helper';

const SkipComponent = () => {
	const { app } = useSelector(state => state);
	const dispatch = useDispatch();
	const { nextSectionId } = app;
	return (
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItem: 'center',
			}}
		>
			<Button
				name='Skip'
				onClick={() => dispatch(setSelectedSectionId(nextSectionId))}
			/>
		</div>
	);
};

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
	const SELECTED_SECTION_MAPPING = {
		basic_details: BasicDetails,
		loan_address_details: AddressDetails,
		employment_details: EmploymentDetails,
		loan_details: LoanDetails,
		collateral_details: SkipComponent,
		bank_details: BankDetails,
		document_upload: DocumentUpload,
		reference_details: SkipComponent,
		emi_details: SkipComponent,
		application_submitted: ApplicationSubmitted,
	};
	let SelectedComponent =
		SELECTED_SECTION_MAPPING?.[selectedSectionId] || BasicDetails;

	// for reseting formstate
	useEffect(() => {
		setLoading(true);
		sleep(100).then(res => {
			setLoading(false);
		});
	}, [selectedSectionId, selectedApplicantCoApplicantId]);

	useEffect(() => {
		console.log('ProductIndividual-allStates-', {
			app,
			application,
			applicantCoApplicants,
		});
	}, [app, application, applicantCoApplicants]);

	return (
		<UI.Wrapper>
			<SideNav />
			<UI.RightSectionWrapper>
				<UI.IconDottedRight src={iconDottedRight} alt='dot' />
				<UI.DynamicSectionWrapper>
					{[...applicantCoApplicantSectionIds, 'document_upload']?.includes(
						selectedSectionId
					) && <ApplicantCoApplicantHeader />}
					<UI.DynamicSubSectionWrapper>
						{loading ? <div /> : <SelectedComponent />}
					</UI.DynamicSubSectionWrapper>
				</UI.DynamicSectionWrapper>
			</UI.RightSectionWrapper>
		</UI.Wrapper>
	);
};

export default ProductIndividual;
