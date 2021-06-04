import Tabs from '../shared/components/Tabs';
import PendingApproval from './PApproval';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function Applications({ d, pApprovalData, setLActive, lActive }) {
	const getTabData = i => {
		return i === lActive;
	};

	return (
		<section className='flex'>
			<section
				style={{
					overflow: 'scroll',
					maxHeight: 'calc(100vh - 5.8rem)',
					height: 'calc(100vh - 5.8rem)',
					paddingLeft: '2rem'
				}}
				className='scroll absolute bg-blue-700 w-1/5 py-16 flex flex-col gap-y-8 bottom-0'
			>
				<span className='text-white font-medium text-xl pl-8'>Loan Applications</span>
				<section>
					{d.map(item => (
						<Tabs k={item} active={lActive === item} click={setLActive} align='vertical' />
					))}
				</section>
			</section>
			<section
				className='absolute right-0 px-24 scroll'
				style={{
					width: '100%',
					maxWidth: 'calc(100vw - 20%)',
					maxHeight: 'calc(100vh)',
					overflow: 'scroll'
				}}
			>
				<section className='top-24 w-7/12 absolute flex items-center'>
					<input
						className='h-10 w-full bg-blue-100 px-4 py-6 focus:outline-none  rounded-full mt-10'
						placeholder=''
					/>
					<FontAwesomeIcon
						className='absolute right-4 bg-blue-100 text-indigo-700 text-2xl top-14 pb-2'
						icon={faSearch}
					/>
				</section>
				<section
					className='w-full right-0 gap-x-20 gap-y-20 flex grid grid-cols-2 pb-10'
					style={{ paddingTop: '16em' }}
				>
					{pApprovalData.data.map(item => getTabData(pApprovalData.key) && <PendingApproval item={item} />)}
				</section>
			</section>
		</section>
	);
}
