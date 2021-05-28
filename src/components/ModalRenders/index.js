import Modal from '../../shared/components/Modal';

export default function ModalRenders(props) {
	const { message, link, show, toggle } = props;
	return (
		<Modal show={show} onClose={toggle} width='lg'>
			<section className='flex flex-col gap-y-10 items-center'>
				<img className='h-40 w-40' alt='error' src={link} />
				<p>{message}</p>
			</section>
		</Modal>
	);
}
