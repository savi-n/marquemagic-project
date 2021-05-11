import styled, { ThemeProvider } from "styled-components";

import Header from "./components/Header";
import Content from "./components/Content";
import Loading from "./components/Loading";
import useFetch from "./hooks/useFetch";
import { WHITE_LABEL_URL } from './config';
import { StoreProvider } from './utils/StoreProvider';

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

    const { response, error, loading } = useFetch({
        url: `${WHITE_LABEL_URL({ name: 'CUB UAT' })}`,
    });

    return (
        loading && !error ? <Loading /> : (
            <StoreProvider state={
                {
                    whiteLabelId: response.permission?.id,
                    logo: response.permission?.logo,
                }
            }>
                <ThemeProvider theme={response.permission?.color_theme_react}>
                    <HeaderWrapper>
                        <Header logo={response.permission?.logo} />
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
