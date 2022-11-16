import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FlowContext } from 'reducer/flowReducer';
import { FormContext } from 'reducer/formReducer';
import { LoanFormContext } from 'reducer/loanFormDataReducer';

// import Router from '../Router';
import ContinueModal from 'components/modals/ContinueModal';
import { UserContext } from 'reducer/userReducer';
import { useToasts } from 'components/Toast/ToastProvider';
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
	const app = useSelector(state => state.app);
	const {
		selectedProduct,
		selectedSectionId,
		applicantCoApplicantSectionIds,
	} = app;
	const applicantCoApplicants = useSelector(
		state => state.applicantCoApplicants
	);
	const { selectedApplicantCoApplicantId } = applicantCoApplicants;
	const { addToast } = useToasts();
	const {
		state: { completed: completedMenu, basePageUrl, productId },
		actions: { clearFlowDetails },
	} = useContext(FlowContext);
	const {
		actions: { clearFormData, setUsertypeAfterRefresh },
	} = useContext(FormContext);

	const {
		actions: { resetUserDetails },
	} = useContext(UserContext);

	const {
		actions: { removeAllLoanDocuments },
	} = useContext(LoanFormContext);

	const [showContinueModal, setShowContinueModal] = useState(false);
	const [loading, setLoading] = useState(false);
	// const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	// const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const onYesClick = () => {
		// setContinueExistingApplication(true);
		if (!completedMenu.includes('document-upload')) {
			setShowContinueModal(true);
			setUsertypeAfterRefresh();
		} else {
			onNoClick();
			addToast({
				message: 'Application already created',
				type: 'error',
			});
		}
	};

	const onNoClick = () => {
		// setContinueExistingApplication(false);
		setShowContinueModal(true);
		const wt_lbl = sessionStorage.getItem('wt_lbl');
		const product_id = sessionStorage.getItem('productId');
		sessionStorage.clear();
		sessionStorage.setItem('wt_lbl', wt_lbl);
		sessionStorage.setItem('productId', product_id);
		clearFlowDetails(basePageUrl);
		clearFormData();
		resetUserDetails();
		removeAllLoanDocuments();
	};

	console.log('ProductIndividual-allStates-', {
		selectedProduct,
		app,
		applicantCoApplicants,
		completedMenu,
		basePageUrl,
	});

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
			{!!completedMenu.length &&
				!showContinueModal &&
				productId === selectedProduct.id && (
					<ContinueModal onYes={onYesClick} onNo={onNoClick} />
				)}
		</UI.Wrapper>
	);
};

export default ProductIndividual;
