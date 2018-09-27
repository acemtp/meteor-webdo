import React from 'react';

const errorHandler = ({ target }) => {
  const { fallback } = target.dataset;
  if (!fallback || target.src === fallback) return;
  target.setAttribute('src', fallback);
};

export const noop = () => { };

export const Img = ({ src, alt, fallback }) => (
  <img src={src} alt={alt} onError={errorHandler} data-fallback={fallback} />
);
