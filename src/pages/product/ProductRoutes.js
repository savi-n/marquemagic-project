import { lazy } from "react";
import { Redirect, Route, useRouteMatch } from "react-router-dom";

const IdentityVerification = lazy(() =>
  import("./identiryVerification/IdentityVerification")
);
const DocumentUpload = lazy(() => import("./documentUpload/DocumentUpload"));
const PersonalDetails = lazy(() => import("./personalDetails/PersonalDetails"));
const AddressDetails = lazy(() => import("./addressDetails/AddressDetails"));
const ApplicationSubmitted = lazy(() =>
  import("./applicationSubmitted/ApplicationSubmitted")
);
const LoanDetails = lazy(() => import("./loanDetails/LoanDetails"));

const CoApplicantDetails = lazy(() => import("../SubType/SubType"));
const CoApplicantIncomeDetails = lazy(() => import("../SubType/SubTypeIncome"));
const CoApplicantDocumentUpload = lazy(() => import("../SubType/SubTypeDocs"));

const availableRoutes = {
  "identity-verification": IdentityVerification,
  "personal-details": PersonalDetails,
  "address-details": AddressDetails,
  "co-applicant-details": CoApplicantDetails,
  "co-applicant-income-details": CoApplicantIncomeDetails,
  "co-applicant-document-upload": CoApplicantDocumentUpload,
  "loan-details": LoanDetails,
  "document-upload": DocumentUpload,
  "application-submitted": ApplicationSubmitted,
  "gurantor-details": CoApplicantDetails,
  "gurantor-income-details": CoApplicantIncomeDetails,
  "gurantor-document-upload": CoApplicantDocumentUpload,
};

export default function FlowRoutes({
  config,
  productDetails = {},
  pageName,
  onComplete,
}) {
  const { path } = useRouteMatch();

  const Component = availableRoutes[config.id];
  if (!Component) return <Redirect to={path} />;
  let subFlow = null;
  if (config.flow) {
    subFlow = config.flow.map((f) => {
      const Comp = availableRoutes[f.id];
      return (
        <Route
          exact
          path={`${path}/${config.id}/${f.id}`}
          component={({ match }) => (
            <Comp
              productId={atob(match.params.product)}
              productDetails={productDetails}
              onComplete={onComplete}
            />
          )}
        />
      );
    });
  }
  return (
    <>
      <Route
        path={`${path}/${config.id}`}
        exact
        component={({ match }) => (
          <Component
            productId={atob(match.params.product)}
            productDetails={productDetails}
            pageName={pageName}
            nextFlow={config.nextFlow}
            onComplete={onComplete}
            id={config.id}
          />
        )}
      />
      {subFlow}
    </>
  );
}
