import { useEffect, useState } from "react";
import styled, { ThemeProvider } from "styled-components";

import Header from "./components/Header";
import Content from "./components/Content";
import Loading from "./components/Loading";
import useFetch from "./hooks/useFetch";
import {
  WHITE_LABEL_URL,
  CLIENT_VERIFY_URL,
  CLIENT_EMAIL_ID,
  BANK_TOKEN_API,
  NC_STATUS_CODE,
} from "./config";
import { StoreProvider } from "./utils/StoreProvider";

const HeaderWrapper = styled.div`
  min-height: 80px;
  max-height: 80px;
  background: ${({ theme }) => theme.themeColor1};
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  display: flex;
  align-items: center;
  padding: 0 50px;
  z-index: 1;
`;

const Div = styled.div`
  flex: 1;
`;

const AppLayout = () => {
  const { response, newRequest } = useFetch({
    url: WHITE_LABEL_URL({ name: "CUB UAT" }),
  });

  const [clientToken, setClientToken] = useState(null);
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

          if (bankToken?.data?.statusCode === NC_STATUS_CODE.success)
            setClientToken(bankToken?.data.generated_key);
        }
      } catch (error) {
        console.log("ERROR => ", error);
      }
      setLoading(false);
    }
    if (response) fetchData();
  }, [response]);

  return loading ? (
    <Loading />
  ) : (
    response && (
      <StoreProvider
        state={{
          whiteLabelId: response.permission.id,
          logo: response.permission.logo,
          clientToken: clientToken,
        }}
      >
        <ThemeProvider theme={response.permission.color_theme_react}>
          <HeaderWrapper>
            <Header logo={response.permission.logo} />
          </HeaderWrapper>
          <Div>
            <Content />
          </Div>
        </ThemeProvider>
      </StoreProvider>
    )
  );
};
export default AppLayout;
