import { lazy } from 'react';
import { Redirect, useRouteMatch } from 'react-router-dom';

import userType from '../../_hoc/userType';
import ProtectedRoute from '../../components/ProtectedRoute';

const IdentityVerification = lazy(() => import('./identityVerification/IdentityVerification'));
const DocumentUpload = lazy(() => import('./documentUpload/DocumentUpload'));
const PersonalDetails = lazy(() => import('./personalDetails/PersonalDetails'));
const AddressDetails = lazy(() => import('./addressDetails/AddressDetails'));
const PanVerification = lazy(() => import('./panverification/pan-verifications'));
const ApplicationSubmitted = lazy(() => import('./applicationSubmitted/ApplicationSubmitted'));
const VehicleLoanDetails = lazy(() => import('./loanDetails/VehicleLoanDetails'));
const HomeLoanDetails = lazy(() => import('./loanDetails/HomeLoanDetails'));
const CoApplicantDetails = lazy(() => import('./coappilcant/CoapplicantDetails'));
const CoApplicantIncomeDetails = lazy(() => import('./coappilcant/CoapplicantIncomeDetails'));
const EmiDetails = lazy(() => import('./emiDetails/EMIDetails'));

const availableRoutes = {
	'pan-verification': { Component: PanVerification },
	'identity-verification': { Component: IdentityVerification },
	'personal-details': { protected: true, Component: PersonalDetails },
	'address-details': { protected: true, Component: AddressDetails },
	// "loan-details": { protected: true, Component: HomeLoanDetails },
	'loan-details': { protected: true, Component: VehicleLoanDetails },
	'home-loan-details': { protected: true, Component: HomeLoanDetails },
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
		Component: userType('Co-applicant', DocumentUpload)
	},
	'emi-details': { protected: true, Component: EmiDetails },
	// "document-upload": { protected: true, Component: VehicleLoanDetails },
	'document-upload': { protected: true, Component: DocumentUpload },
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
		Component: userType('Guarantor', DocumentUpload)
	}
};

export default function FlowRoutes({ config, productDetails = {} }) {
	const { path, url } = useRouteMatch();

	const Page = availableRoutes[config.id];

	if (!Page) return <Redirect to={url} />;

	let subFlow = null;
	if (config.flow) {
		subFlow = config.flow.map(f => {
			const InnerPage = availableRoutes[f.id];
			return (
				<ProtectedRoute
					key={f.id}
					path={`${path}/${config.id}/${f.id}`}
					protectedRoute={InnerPage.protected || false}
					pageName={f.name}
					Component={props => (
						<InnerPage.Component
							productDetails={productDetails}
							pageName={f.name}
							id={f.id}
							mainPageId={config.id}
							url={url}
							{...props}
						/>
					)}
				/>
			);
		});
	}
	return (
		<>
			<ProtectedRoute
				path={`${path}/${config.id}`}
				protectedRoute={Page.protected || false}
				pageName={config.name}
				Component={props => (
					<Page.Component productDetails={productDetails} pageName={config.name} id={config.id} {...props} />
				)}
			/>
			{subFlow}
		</>
	);
}
