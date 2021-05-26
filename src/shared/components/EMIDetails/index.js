import DetailsComponent from '../Details';

export default function EMIDetails(props) {
	return (
		<section className='py-16'>
			<h1 className='font-bold'>EMI details of exsisting loans availed by CUB or other banks, if any..</h1>
			<DetailsComponent data={props.jsonData} split={true} sideHead='(in ₹)' />
		</section>
	);
}
