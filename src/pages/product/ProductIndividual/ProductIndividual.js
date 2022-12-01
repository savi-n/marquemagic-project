import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';

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

import { setIsTestMode } from 'store/appSlice';
import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
import * as UI from './ui';
import { sleep } from 'utils/helper';
import { TEST_DOMAINS } from '_config/app.config';

const ProductIndividual = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedSectionId,
		applicantCoApplicantSectionIds,
		userToken,
		isTestMode,
		// nextSectionId,
	} = app;
	const { selectedApplicantCoApplicantId } = applicantCoApplicants;
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const SELECTED_SECTION_MAPPING = {
		basic_details: BasicDetails,
		loan_address_details: AddressDetails,
		employment_details: EmploymentDetails,
		loan_details: LoanDetails,
		collateral_details: CollateralDetails,
		bank_details: BankDetails,
		document_upload: DocumentUpload,
		reference_details: ReferenceDetails,
		emi_details: EMIDetails,
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
	}, [selectedSectionId, selectedApplicantCoApplicantId, isTestMode]);

	useEffect(() => {
		console.log('ProductIndividual-allStates-', {
			app,
			application,
			applicantCoApplicants,
		});
	}, [app, application, applicantCoApplicants]);

	useEffect(() => {
		if (!userToken) return;
		// console.log('setting default header axios-');
		axios.defaults.headers.Authorization = `Bearer ${userToken}`;
		// dispatch(setSelectedSectionId(nextSectionId));
		// eslint-disable-next-line
	}, [userToken]);

	useEffect(() => {
		if (TEST_DOMAINS.includes(window.location.hostname)) {
			const params = queryString.parse(window.location.search);
			if (params.isTestMode) {
				dispatch(setIsTestMode(true));
			} else {
				dispatch(setIsTestMode(false));
			}
		}
		// eslint-disable-next-line
	}, []);

	return (
		<UI.Wrapper>
			{/* {selectedSectionId !== 'application_submitted' && <SideNav />} */}
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
