import styled from 'styled-components';

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const SelectWrapper = styled.select`
	text-align: left;
	box-sizing: border-box;
	padding: 20px;
	margin-bottom: 25px;
	border: 1px solid #ccc;
	border-radius: 4px;
	//	width: 500px;
	width: 100%;
	max-width: 800px;
`;

export const ResponsiveWrapper = styled.div`
	width: 100%;
`;

export const CustomerDetailsFormModalHeader = styled.h2`
	font-size: 1.5rem;
	font-weight: 500;
	margin: 20px 0;
`;

export const CustomerDetailsFormModalFooter = styled.div`
	display: flex;
	justify-content: end;
	gap: 20px;
`;

// CustomerListModal

// export const CustomerListWrapper = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	gap: 10px;
// `;

// export const CustomerListCard = styled.div`
// 	display: flex;
// 	justify-content: space-between;
// 	border-radius: 14px;
// 	padding: 10px;
// 	background: #ffffff;
// 	box-shadow: 10px 10px 30px 3px rgba(11, 92, 255, 0.15);
// 	margin-bottom: 20px;
// 	cursor: pointer;
// 	background-color: ${({ isActive }) => (isActive ? '#eee' : 'white')};

// 	@media (max-width: 768px) {
// 		display: block;
// 	}
// `;

// export const CustomerListCardItem = styled.div`
// 	flex: 1;
// 	padding: 10px;
// 	text-align: center;
// `;

// export const CustomerListModalHeader = styled.span`
// 	font-weight: 600;
// 	font-size: 30px;
// 	line-height: 54px;
// 	text-align: center;
// 	display: flex;
// 	justify-content: center;
// 	color: #4e4e4e;
// 	//marginBottom: '30px',
// `;

// export const CustomerListModalSubHeader = styled.span`
// 	//font-weight: 600;
// 	font-size: 15px;
// 	//line-height: 54px;
// 	text-align: center;
// 	display: flex;
// 	justify-content: center;
// 	color: #4e4e4e;
// 	//margin-bottom: 30px;
// `;
