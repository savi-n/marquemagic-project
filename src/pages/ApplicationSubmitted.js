import { useState } from 'react';
import Layout from '../Layout';
import Button from '../shared/components/Button';
import { clearLC } from '../utils/clearStorage';

export default function ApplicationSubmitted(props) {
	const [gurantor, setGurantor] = useState(true);

	return (
		<Layout>
			<section className='flex flex-col items-center gap-y-6'>
				<span>
					Your application has been forwarded to the branch, desicion shall be communicated within 2-3 working
					days.
				</span>
				{gurantor ? (
					<section className='flex flex-col items-center gap-y-4 font-semibold'>
						Any Gurantor?
						<section className='flex gap-x-5'>
							<Button onClick={props.click}>Yes</Button>
							<Button onClick={() => setGurantor(false)}>No</Button>
						</section>
					</section>
				) : (
					<Button onClick={() => clearLC()} type='blue'>
						Done
					</Button>
				)}
			</section>
		</Layout>
	);
}
