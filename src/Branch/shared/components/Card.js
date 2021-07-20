export default function Card(props) {
	const {
		reconsider,
		reopen,
		security,
		status,
		download,
		approvalHistory,
		reassign,
		queries,
		comments,
		recommendation,
		reasonForRejection,
		AR,
		full
	} = props;

	const getter = () => {
		if (
			reconsider ||
			reopen ||
			security ||
			status ||
			download ||
			approvalHistory ||
			reassign ||
			queries ||
			comments ||
			recommendation ||
			reasonForRejection ||
			AR
		)
			return true;
	};

	return (
		<main
			style={{
				boxShadow: '0 0 19px 0px #98AFC7',
				height: `${getter() ? '40rem' : 'auto'}`,
				maxHeight: `${getter() ? '80rem' : '350px'}`,
				width: `${!full ? 'calc(100%/3)' : '100%'}`,
				maxWidth: `${getter() ? '100%' : '100%'}`
			}}
			className={`${full && 'w-full'} p-6 h-full rounded-md flex-flex-col`}
		>
			{props.head && (
				<section className='pb-6 flex flex-col gap-y-2'>
					<small className='text-sm'>{props.head && props.head.toUpperCase()}</small>
					{props.head && <hr />}
				</section>
			)}
			{props.children}
		</main>
	);
}
