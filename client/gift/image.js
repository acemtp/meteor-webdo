import React from 'react';
import PropTypes from 'prop-types';

import { Img } from '/client/util';

const GiftImage = ({ image, title }) => (
  image ? (
    <Img
      src={`http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${image}`}
      alt={title}
      fallback="/photo/gift-default.png"
    />
  ) : (
    <Img
      src="/photo/gift-default.png"
      alt={title}
    />
  )
);

GiftImage.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default GiftImage;
