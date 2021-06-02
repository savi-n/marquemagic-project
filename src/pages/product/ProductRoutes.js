import { lazy } from "react";
import { Redirect, Route, useRouteMatch } from "react-router-dom";

import userType from "../../_hoc/userType";

const IdentityVerification = lazy(() =>
  import("./identityVerification/IdentityVerification")
);
const DocumentUpload = lazy(() => import("./documentUpload/DocumentUpload"));
const PersonalDetails = lazy(() => import("./personalDetails/PersonalDetails"));
const AddressDetails = lazy(() => import("./addressDetails/AddressDetails"));
const ApplicationSubmitted = lazy(() =>
  import("./applicationSubmitted/ApplicationSubmitted")
);
const LoanDetails = lazy(() => import("./loanDetails/LoanDetails"));
const CoApplicantDetails = lazy(() =>
  import("./coappilcant/CoapplicantDetails")
);
const CoApplicantIncomeDetails = lazy(() =>
  import("./coappilcant/CoapplicantIncomeDetails")
);

const availableRoutes = {
  "identity-verification": IdentityVerification,
  "personal-details": PersonalDetails,
  "address-details": AddressDetails,
  "loan-details": LoanDetails,
  "co-applicant-details": userType("Co-applicant", CoApplicantDetails),
  "co-applicant-income-details": userType(
    "Co-applicant",
    CoApplicantIncomeDetails
  ),
  "co-applicant-document-upload": userType("Co-applicant", DocumentUpload),
  "document-upload": DocumentUpload,
  "application-submitted": ApplicationSubmitted,
  "gurantor-details": userType("Gurantor", CoApplicantDetails),
  "gurantor-income-details": userType("Gurantor", CoApplicantIncomeDetails),
  "gurantor-document-upload": userType("Gurantor", DocumentUpload),
};

export default function FlowRoutes({ config, productDetails = {} }) {
  const { path } = useRouteMatch();

  const Component = availableRoutes[config.id];
  if (!Component) return <Redirect to={path} />;
  let subFlow = null;
  if (config.flow) {
    subFlow = config.flow.map((f) => {
      const Comp = availableRoutes[f.id];
      return (
        <Route
          key={f.id}
          exact
          path={`${path}/${config.id}/${f.id}`}
          component={({ match }) => (
            <Comp
              productId={atob(match.params.product)}
              productDetails={productDetails}
              pageName={f.name}
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
            pageName={config.name}
            nextFlow={config.nextFlow}
            id={config.id}
          />
        )}
      />
      {subFlow}
    </>
  );
}
