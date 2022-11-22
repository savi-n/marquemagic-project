// below code belongs to display left and right indicator / CTA for scroll allicant-coapplicants

// import iconLeftArrowInActive from 'assets/icons/left_arrow_inactive.png';
// import iconRightArrowInActive from 'assets/icons/right_arrow_inactive.png';
// import iconLeftArrowActive from 'assets/icons/left_arrow_active.png';
// import iconRightArrowActive from 'assets/icons/right_arrow_active.png';
// const [scrollPos, setScrollPos] = useState(0);

// const maxWidth = refListWrapper?.current?.clientWidth
// 	? refListWrapper?.current?.clientWidth + 400
// 	: 500;

// const onSchroll = operator => {
// 	let element = document.getElementById('appRefList');
// 	let newScrollValue = scrollPos;
// 	// const maxScrollLendth = refListWrapper.
// 	if (operator === '+') {
// 		newScrollValue += 200;
// 		if (newScrollValue > maxWidth) newScrollValue = maxWidth;
// 	}
// 	if (operator === '-') {
// 		newScrollValue -= 200;
// 		if (newScrollValue < 0) newScrollValue = 0;
// 	}
// 	setScrollPos(newScrollValue);
// 	element.scroll({
// 		left: newScrollValue,
// 		behavior: 'smooth',
// 	});
// };

//  {coApplicants.length >= 100 ? (
// 	<UI.IndecatorWrapper>
// 		<UI.Indecator
// 			// src={scrollPos <= 0 ? iconLeftArrowActive : iconLeftArrowInActive}
// 			src={iconLeftArrowInActive}
// 			alt='leftarrow'
// 			onClick={() => onSchroll('-')}
// 		/>
// 		<UI.Indecator
// 			// src={
// 			// 	scrollPos >= maxWidth
// 			// 		? iconRightArrowActive
// 			// 		: iconRightArrowInActive
// 			// }
// 			src={iconRightArrowInActive}
// 			alt='rightarrow'
// 			onClick={() => onSchroll('+')}
// 		/>
// 	</UI.IndecatorWrapper>
// ) : null}
