import { useEffect, useState, useContext, Suspense, lazy } from "react";
import styled, { ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import GlobalStyle from "../components/Styles/GlobalStyles";
import Header from "./Header";
import Loading from "./Loading";
import useFetch from "../hooks/useFetch";
import {
  WHITE_LABEL_URL,
  CLIENT_VERIFY_URL,
  CLIENT_EMAIL_ID,
  BANK_TOKEN_API,
  NC_STATUS_CODE,
  APP_DOMAIN,
} from "../_config/app.config.js";
import { AppContext } from "../reducer/appReducer";
// import { useToasts } from "../components/Toast/ToastProvider";

const HeaderWrapper = styled.div`
  min-height: 80px;
  max-height: 80px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  display: flex;
  align-items: center;
  padding: 0 50px;
  z-index: 1;
`;

const Div = styled.div`
  flex: 1;
`;

const ApplyLoanContent = lazy(() => import("./ApplyLoanContent"));
const BranchUserContent = lazy(() => import("./BranchUserContent"));

const AppLayout = () => {
  const { response, newRequest } = useFetch({
    url: WHITE_LABEL_URL({ name: "Clixcapital" }),
  });

  const {
    actions: { setClientToken, setBankToken, setWhitelabelId, setLogo },
  } = useContext(AppContext);

  // const { addToast } = useToasts();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await newRequest(CLIENT_VERIFY_URL, {
          method: "POST",
          data: {
            email: CLIENT_EMAIL_ID,
            white_label_id: response.permission.id,
          },
        });

        const clientId = res.data;

        if (clientId?.statusCode === 200) {
          const bankToken = await newRequest(
            BANK_TOKEN_API,
            {
              method: "POST",
              data: {
                type: "BANK",
                linkRequired: false,
                isEncryption: false,
              },
            },
            {
              authorization: clientId.token,
            }
          );

          if (bankToken?.data?.statusCode === NC_STATUS_CODE.NC200) {
            setClientToken(clientId.token);
            setBankToken(
              bankToken?.data.generated_key,
              bankToken?.data.request_id
            );
          }
        }
      } catch (error) {
        // addToast({
        //   message: "Something Went Wrong. Try Again Later!",
        //   type: "error",
        // });
        console.log("ERROR => ", error);
      }
      setLoading(false);
    }
    if (response) {
      setWhitelabelId(response?.permission?.id);
      setLogo(response?.permission?.logo);
      fetchData();
    }
  }, [response]);

  return loading ? (
    <Loading />
  ) : (
    response && (
      <ThemeProvider theme={response.permission.color_theme_react}>
        <GlobalStyle />
        {!window.location.href.includes("branch") && (
          <HeaderWrapper>
            <Header logo={response.permission.logo} />
          </HeaderWrapper>
        )}
        <Div>
          <BrowserRouter basename={`${APP_DOMAIN}`}>
            <Suspense fallback={<Loading />}>
              <Switch>
                <Route
                  path="/branch"
                  manager={true}
                  component={BranchUserContent}
                />
                <Route path="/applyloan" component={ApplyLoanContent} />
                <Route render={() => <Redirect to="/applyloan" />} />
              </Switch>
            </Suspense>
          </BrowserRouter>
        </Div>
      </ThemeProvider>
    )
  );
};

export default AppLayout;
