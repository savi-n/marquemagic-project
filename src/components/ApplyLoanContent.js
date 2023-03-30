import { Suspense, lazy } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import Loading from 'components/Loading';
import CustomerStoreProvider from '../_hoc/customerStoreProviders';

const Products = lazy(() => import('../pages/products/Products'));
const Product = lazy(() =>
	import('../pages/product/ProductIndividual/ProductIndividual')
);

export default function ApplyLoanContent() {
	const { path } = useRouteMatch();
	return (
		<CustomerStoreProvider>
			<Suspense fallback={<Loading />}>
				<Switch>
					<Route
						path={`${path}/product/:product`}
						component={({ match }) => (
							<Product product={match.params.product} />
						)}
					/>
					<Route exact path={`${path}`} component={Products} />
				</Switch>
			</Suspense>
		</CustomerStoreProvider>
	);
}
