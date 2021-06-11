import Button from '../shared/components/Button';

export default function Reject({ setReject }) {
	return (
		<section className=' py-10 rounded-md flex flex-col gap-y-4 justify-end'>
			<textarea
				placeholder='Add Reason'
				className='border focus:outline-none rounded-md w-full resize-none p-2'
			/>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => setReject(false)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => setReject(false)}>
					Cancel
				</Button>
			</section>
		</section>
	);
}
