import { Suspense, lazy } from 'react';
import { func, object, oneOfType, string } from 'prop-types';

import userType from '../../_hoc/userType';
import Loading from '../../components/Loading';

const ProductDetails = lazy(() => import('./productDetails/ProductDetails'));
const IdentityVerification = lazy(() => import('./identityVerification/IdentityVerification'));

const BusinessVerification = lazy(() => import('./bussinessVerification/BussinessVerification'));

const PanVerification = lazy(() => import('./panverification/pan-verifications'));

const DocumentUpload = lazy(() => import('./documentUpload/LoanDocumentsUpload'));
const CubDocumentUpload = lazy(() => import('./documentUpload/CubDocumentUpload'));
const PersonalDetails = lazy(() => import('./personalDetails/PersonalDetails'));
const AddressDetails = lazy(() => import('./addressDetails/AddressDetails'));
const LoanAddressDetails = lazy(() => import('./addressDetails/LoanAddressDetails'));

const ApplicationSubmitted = lazy(() => import('./applicationSubmitted/ApplicationSubmitted'));
const TwoWheelerLoanDetails = lazy(() => import('./loanDetails/TwoWheelerLoanDetails'));
const FourWheelerLoanDetails = lazy(() => import('./loanDetails/FourWheelerLoanDetails'));
const HomeLoanDetails = lazy(() => import('./loanDetails/HomeLoanDetails'));
const CoApplicantDetails = lazy(() => import('./coappilcant/CoapplicantDetails'));
const CoApplicantIncomeDetails = lazy(() => import('./coappilcant/CoapplicantIncomeDetails'));
const EmiDetails = lazy(() => import('./emiDetails/EMIDetails'));

const FormDefaultPage = lazy(() => import('./formPage/FormController'));

const LapLoanDetails = lazy(() => import('./loanDetails/LapLoanDetails.js'));

const availableRoutes = {
	'pan-verification': { Component: PanVerification },
	'product-details': { Component: ProductDetails },
	'identity-verification': { Component: IdentityVerification },
	'business-verification': { Component: BusinessVerification },
	'personal-details': { protected: true, Component: PersonalDetails },
	'address-details': { protected: true, Component: LoanAddressDetails },
	'loan-address-details': { protected: true, Component: LoanAddressDetails },
	'two-wheeler-loan-details': {
		protected: true,
		Component: TwoWheelerLoanDetails
	},
	'four-wheeler-loan-details': {
		protected: true,
		Component: FourWheelerLoanDetails
	},
	'loan-details': {
		protected: true,
		Component: FourWheelerLoanDetails
	},
	'home-loan-details': { protected: true, Component: HomeLoanDetails },
	'lap-loan-details': { protected: true, Component: LapLoanDetails },
	'co-applicant-details': {
		protected: true,
		Component: userType('Co-applicant', CoApplicantDetails)
	},
	'co-applicant-income-details': {
		protected: true,
		Component: userType('Co-applicant', CoApplicantIncomeDetails)
	},
	'co-applicant-document-upload': {
		protected: true,
		Component: userType('Co-applicant', CubDocumentUpload)
	},
	'emi-details': { protected: true, Component: EmiDetails },
	'document-upload': { protected: true, Component: DocumentUpload },
	'cub-document-upload': { protected: true, Component: CubDocumentUpload },
	'application-submitted': { protected: true, Component: ApplicationSubmitted },
	'guarantor-details': {
		protected: true,
		Component: userType('Guarantor', CoApplicantDetails)
	},
	'guarantor-income-details': {
		protected: true,
		Component: userType('Guarantor', CoApplicantIncomeDetails)
	},
	'guarantor-document-upload': {
		protected: true,
		Component: userType('Guarantor', CubDocumentUpload)
	}
};

// const fieldConfig = {
//   "2 wheeler": require("../../shared/constants/twoWheelerFields.json"),
//   "4 wheeler": require("../../shared/constants/fourWheelerFields.json"),
//   "Home Loan": require("../../shared/constants/homeFields.json"),
// };

export default function Router({ currentFlow, productDetails = {}, map, onFlowChange, productId }) {
	if (!currentFlow) {
		return <Loading />;
	}

	const component = availableRoutes[currentFlow] || {
		Component: FormDefaultPage
	};

	return (
		<Suspense fallback={<Loading />}>
			<component.Component
				productDetails={productDetails}
				// fieldConfig={fieldConfig[productDetails.loanType]}
				onFlowChange={onFlowChange}
				map={map}
				id={currentFlow}
				productId={productId}
			/>
		</Suspense>
	);
}

Router.propTypes = {
	currentFlow: string,
	productDetails: object,
	onFlowChange: func,
	map: oneOfType([string, object]),
	productId: object.isRequired
};
