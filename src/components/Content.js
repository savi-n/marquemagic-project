import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Loading from './Loading';
import { APP_DOMAIN } from '../_config/app.config';

const Products = lazy(() => import('../pages/products/Products'));
const Product = lazy(() => import('../pages/product/Product'));

export default function Content() {
	console.log(APP_DOMAIN);
	return (
		<>
			<BrowserRouter basename={`${APP_DOMAIN}`}>
				<Suspense fallback={<Loading />}>
					<Switch>
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
