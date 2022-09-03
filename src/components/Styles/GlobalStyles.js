// globalStyles.js - Global styling used in AppLayout.jsonData

import { createGlobalStyle } from 'styled-components';
import font1 from 'assets/fonts/OpenSans-Regular.ttf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'CUBFont';
    src:  url(${font1})  format('truetype');
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'CUBFont';
  }
`;

export default GlobalStyle;
