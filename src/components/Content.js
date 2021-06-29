import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Loading from './Loading';
import { APP_DOMAIN } from '../_config/app.config';
import Dashboard from '../Branch/pages/Dashboard';

const Products = lazy(() => import('../pages/products/Products'));
const Product = lazy(() => import('../pages/product/Product'));

export default function Content() {
	return (
		<>
			<BrowserRouter basename={`${APP_DOMAIN}`}>
				<Suspense fallback={<Loading />}>
					<Switch>
						<Route path={['/branch-user', '/branch-manager']} manager={true} component={Dashboard} />
						<Route exact path={`/applyloan`} component={Products} />
						<Route
							path={`/product/:product`}
							component={({ match }) => <Product product={match.params.product} url={match.url} />}
						/>
						<Route render={() => <Redirect to={`/applyloan`} />} />
					</Switch>
				</Suspense>
			</BrowserRouter>
		</>
	);
}
