import Tabs from '../shared/components/Tabs';
import Button from '../shared/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { REDIRECT_CREATE } from '../../_config/app.config';

export default function Header({ click, active }) {
	return (
		<main className='w-full fixed z-50'>
			<header
				className={`w-full ${
					active === 'Home' ? ' bg-blue-700' : 'bg-white shadow-lg'
				} flex gap-x-10 justify-end px-10 items-center`}>
				<section className='flex '>
					{['Home', 'Loan Applications'].map(i => (
						<Tabs
							k={i}
							active={active === i}
							text={active === 'Home' ? 'white' : 'black'}
							click={click}
							align='horizontal'
						/>
					))}
				</section>
				<Button
					onClick={() => (window.location.href = REDIRECT_CREATE)}
					rounded='rfull'
					type={active !== 'Home' ? 'blue-light' : 'white'}>
					<section className='flex gap-x-3 items-center'>
						<span>Create Application</span>{' '}
						<FontAwesomeIcon icon={faChevronRight} />
					</section>
				</Button>
				<FontAwesomeIcon
					title='Logout'
					onClick={() => {
						sessionStorage.removeItem('token');
						window.location.href = `${
							window.location.origin.includes('localhost')
								? `${window.location.origin}/branch/login`
								: `${window.location.origin}/login`
						}`;
					}}
					icon={faPowerOff}
					className={`text-${
						active === 'Home' ? 'white' : 'black'
					} cursor-pointer`}
				/>
			</header>
		</main>
	);
}
