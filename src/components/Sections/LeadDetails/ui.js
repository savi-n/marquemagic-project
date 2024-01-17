import styled from 'styled-components';

export const FieldWrapper = styled.div`
	display: flex;
	gap: 10px;
`;

export const IconDelete = styled.img`
	height: 30px;
	width: 30px;
`;

export const UploadIconWrapper = styled.div`
	/* border: 1px solid red; */
	position: absolute;
	right: 0;
	margin-right: 15px;
	cursor: pointer;
`;

export const IconUpload = styled.img`
	height: 30px;
	width: 30px;
`;

export const ImgClose = styled.img`
	height: 25px;
	margin: 1rem;
	cursor: pointer;
	margin-left: auto;
	margin-right: ${({ isPreTag }) => (isPreTag ? '60px' : '10px')};
`;

export const ProfilePicWrapper = styled.div`
	margin-bottom: 10px;
`;
export const TableParentDiv = styled.div`
	height: 300px;
	display: flex;
	flex-direction: column;
	overflow-y: hidden;

	// hiding scroll bar, if the table is not in focus(hovered)
	&:hover {
		overflow-y: scroll;
		::-webkit-scrollbar {
			width: 7px;
			background-color: rgba(0, 0, 0, 0.2);
		}
		::-webkit-scrollbar-thumb {
			background-color: rgba(0, 0, 0, 0.5);
			border-radius: 3px;
		}
	}

	&.hide-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		transition: background-color 0.2s ease-in-out;
	}
	&.hide-scrollbar:hover::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.8);
	}
	&.hide-scrollbar:hover::-webkit-scrollbar-thumb:hover {
		background-color: rgba(0, 0, 0, 1);
	}
	&.hide-scrollbar {
		transition: 1s;
	}
`;

export const TableHeader = styled.div`
	padding: 5px;
	border-radius: 10px;
	position: sticky;
	top: 0;
	display: flex;
	background-color: #f0f0f0;
`;
export const TableDataRowWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;
export const TableRow = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`;

export const TableColumn = styled.div`
	flex: 1;
	padding: 8px;
	text-align: center;
`;




// modal

export const Wrapper = styled.div`
  width: 25%;
  border-radius: 10px;
  /* background: ${({ theme }) => theme.themeColor1}; */
  overflow: hidden;
  /* box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%); */
	/* #0b5cff */
	/* rgb(11, 92, 255) */
	/* rgb(11, 92, 255, 0.15) */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px; */
	/* box-shadow: rgb(11, 92, 255, 0.15) 0px 48px 100px 0px; */
	box-shadow: rgba(11, 92, 255, 0.2) 0px 7px 29px 0px;
  margin: 0 calc(12% / 6);
	@media (max-width: 700px) {
margin: 1rem 0;
width: 100%;
	}
`;

export const DivAdd = styled.div`
	gap: 40px 0;
	padding: 20px 0 20px 0;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	/* @media (max-width: 700px) {
		gap: 0;
	} */
	/* gap: 50px; */
	/* align-items: center; */
	/* gap: calc(12% / 3); */
`;



export const ImgDiv = styled.div`
	width: 100%;
	height: 250px;
`;

export const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const ImgSelectProduct = styled.img`
	height: 35px;
	margin: 0 auto;
`;

export const InputWrapper = styled.input`
	text-align: left;
	box-sizing: border-box;
	padding: 20px;
	margin-bottom: 25px;
	border: 1px solid #ccc;
	border-radius: 4px;
	//width: 500px;
	//height: 91px;
	width: 100%;
	max-width: 800px;
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

// export const ButtonBox = styled.div`
//   /* background: ${({ theme }) => theme.themeColor1}; */
//   text-align: center;
//   padding: 40px;
//   padding: 20px;
// `;

// export const Link = styled.a`
// 	text-decoration: none;
// 	color: #fff;
// 	background: ${({ theme }) => theme.main_theme_color};
// 	padding: 5px 40px;
// 	display: inline-block;
// 	border-radius: 20px;
// 	cursor: pointer;
// `;

export const Description = styled.div`
	color: ${({ theme }) => theme.themeColor2};
	padding: 10px 0;
`;

export const ProductName = styled.div`
	text-align: center;
	padding-top: 50px;
	color: #4e4e4e;
	font-weight: bold;
`;

export const ButtonWrapper = styled.div`
	text-align: center;
	padding-top: 20px;
	padding-bottom: 20px;
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

export const CustomerListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const CustomerListCard = styled.div`
	display: flex;
	justify-content: space-between;
	border-radius: 14px;
	padding: 10px;
	background: #ffffff;
	box-shadow: 10px 10px 30px 3px rgba(11, 92, 255, 0.15);
	margin-bottom: 20px;
	cursor: pointer;
	background-color: ${({ isActive }) => (isActive ? '#eee' : 'white')};

	@media (max-width: 768px) {
		display: block;
	}
`;

export const CustomerListCardItem = styled.div`
	flex: 1;
	padding: 10px;
	text-align: center;
`;

export const CustomerListModalHeader = styled.span`
	font-weight: 600;
	font-size: 30px;
	line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//marginBottom: '30px',
`;

export const CustomerListModalSubHeader = styled.span`
	//font-weight: 600;
	font-size: 15px;
	//line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//margin-bottom: 30px;
`;

// CustomerListModal
