import { useContext } from 'react';
import Card from '../components/Card';
import useFetch from '../hooks/useFetch';
import { StoreContext } from '../utils/StoreProvider';
import { PRODUCT_LIST_URL } from '../config';

export default function Products() {
	const {
		state: { whiteLabelId }
	} = useContext(StoreContext);
	const { response: products } = useFetch({
		url: `${PRODUCT_LIST_URL({ whiteLabelId })}`,
		options: { method: 'GET' }
	});

	return (
		<section className='px-32 py-16'>
			<h3 className='text-center text-gray-700'>Select a Loan Product</h3>
			<div className='py-10 px-0 flex items-center grid-cols-4 gap-24'>
				{products && products.data.map(product => <Card product={product} key={`product__${product.id}`} />)}
			</div>
		</section>
	);
}
