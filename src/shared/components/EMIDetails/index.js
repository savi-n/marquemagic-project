import DetailsComponent from '../Details';

export default function EMIDetails(props) {
	return (
		<section className='py-16'>
			<h1 className='font-semibold'>EMI details of exsisting loans availed by CUB or other banks, if any..</h1>
			<DetailsComponent {...props} data={props.jsonData} sideHead='(in ₹)' />
		</section>
	);
}
