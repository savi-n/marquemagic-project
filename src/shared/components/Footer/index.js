import { useHistory } from 'react-router-dom';
import Button from '../Button';
import { flower } from '../../../utils/helper';

export default function Footer(props) {
	const history = useHistory();

	const url = flower(history);
	return (
		<section className='flex items-center'>
			<section className='w-full'>
				<section className={`flex ${props.cancel ? 'w-1/3' : 'w-1/5 gap-x-5'} justify-between`}>
					{!props.submit ? (
						<Button onClick={() => history.push(url)} type='blue'>
							Proceed
						</Button>
					) : (
						<Button type='blue' onClick={props.submitHandler}>
							Submit
						</Button>
					)}
					<Button>Save</Button>
					{props.cancel && <Button onClick={props.click}>Cancel</Button>}
				</section>
			</section>

			{props.subTypeButton && !props.addedApplicant && (
				<section className='flex items-center gap-x-5 w-full'>
					<span className='text-indigo-700 font-semi-bold text-lg'>Co-applicants?</span>
					<Button onClick={props.click} type='blue'>
						Add
					</Button>
				</section>
			)}
		</section>
	);
}
