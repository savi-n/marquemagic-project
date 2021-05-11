
import { Suspense, lazy, useContext } from 'react';
import { Route, Switch, useRouteMatch, useHistory } from "react-router-dom";
import { string } from 'prop-types';
import styled from 'styled-components'

import { v4 as uuidv4 } from 'uuid';

import { PRODUCT_DETAILS_URL } from '../config';
import useFetch from '../hooks/useFetch';
import { StoreContext } from '../utils/StoreProvider';
import Loading from '../components/Loading';
import CheckBox from '../components/CheckBox';

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;

const Colom1 = styled.div`
    width: 25%;
    background: ${({ theme }) => theme.buttonColor1};
    color: ${({ theme }) => theme.themeColor1};
    padding: 50px 20px;
`;

const Colom2 = styled.div`
    flex: 1;
    background: ${({ theme }) => theme.themeColor1};
    display: flex;
`;

const Head = styled.h4`
    border: ${({ active }) => active ? '1px solid' : 'none'};
    border-radius: 10px;
    padding: 15px 20px;
    margin: 10px 0;
`;

const Menu = styled.h5`
    border: ${({ active }) => active ? '1px solid' : 'none'};
    border-radius: 10px;
    padding: 15px 20px;
    margin: 10px 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const SubMenu = styled.div`
    padding: 0 20px;
`;

const LoanDetails = lazy(() => import('../pages/LoanDetails'));
const IdentityVerification = lazy(() => import('../pages/IdentityVerification'));
const DocumentUpload = lazy(() => import('../pages/DocumentUpload'));

export default function Product({ product, page }) {

    const { state: { whiteLabelId } } = useContext(StoreContext);

    const { response } = useFetch({
        url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
        options: { method: 'GET' }
    })

    const history = useHistory();

    let { path } = useRouteMatch();

    const handleClick = (e, url) => {
        e.preventDefault();
        history.push(url);
    }
    return (
        <Wrapper>
            <Colom1>
                <a
                    href={`/product/${product}  `}
                    onClick={(e) => handleClick(e, `/product/${product}`)}>
                    <Head active={page === '1'}>
                        {response?.data?.name} <small>{response?.data?.description}</small>
                    </Head>
                </a>
                {
                    response?.data?.product_details?.step.map(m => (
                        <a
                            href={`/product/${product}/${m.page}`} key={uuidv4()}
                            onClick={(e) => handleClick(e, `/product/${product}/${m.page}`)}>
                            <Menu
                                active={page === m.page.toString()}
                            >
                                <div>{m.name}</div>
                                {!!m.subStep && (
                                    <CheckBox bg='white' checked round fg={'blue'} />
                                )}
                            </Menu>
                        </a>
                    ))
                }
            </Colom1>
            <Colom2>
                <Suspense fallback={<Loading />}>
                    <Switch>
                        <Route
                            exact
                            path={`${path}`}
                            component={() => <LoanDetails
                                loanDetails={response?.data?.product_details}
                            />} />

                        <Route
                            path={`${path}/identity-verification`}
                            component={() => <IdentityVerification
                                loanDetails={response?.data?.product_details}
                            />} />

                        <Route
                            path={`${path}/document-upload`}
                            component={() => <DocumentUpload
                                loanDetails={response?.data?.product_details}
                                userType={''}
                            />} />
                    </Switch>
                </Suspense>
            </Colom2>
        </Wrapper>)
}

Product.propTypes = {
    product: string.isRequired
};
