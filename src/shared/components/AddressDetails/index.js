import DetailsComponent from '../Details';
import Button from '../Button';

export default function AddressDetails(props) {
	return (
		<>
			<h1 className='text-lg sm:text-xl text-black'>
				Help us with your <span className='text-blue-600'>{props.pageName || 'Address Details'}</span>
			</h1>
			<section className='flex justify-between'>
				<section className='flex flex-col w-full'>
					<DetailsComponent data={props.jsonData} head='Permanent Address' />
				</section>
				<section className='flex flex-col w-full'>
					<DetailsComponent headLink={true} data={props.jsonData} head='Present Address' />
				</section>
			</section>
		</>
	);
}
