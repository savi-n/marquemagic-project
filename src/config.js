import taggedTemplate from './utils/taggedTemplate';

const API_END_POINT = process.env.REACT_APP_API_URL || 'http://3.0.103.80:1337';

const WHITE_LABEL_URL = "/wot/whitelabelsolution?name=CUB UAT";
const PRODUCT_LIST_URL = taggedTemplate`/productDetails?white_label_id=${'whiteLabelId'}`;
const PRODUCT_DETAILS_URL = taggedTemplate`/productDetails?white_label_id=${'whiteLabelId'}&product_id=${'productId'}`;



export {
    API_END_POINT,
    WHITE_LABEL_URL,
    PRODUCT_LIST_URL,
    PRODUCT_DETAILS_URL
}