import React from 'react';

const FullStar = () => (
  <svg width="16" height="16" fill="#FFD71B" viewBox="0 0 16 16">
    <path d="M3.612 15.443c-.396.217-.862-.149-.746-.592l.83-4.73-3.523-3.356c-.33-.315-.158-.888.283-.95l4.898-.696 2.148-4.373c.197-.403.73-.403.927 0l2.148 4.373 4.898.696c.441.062.613.635.283.95l-3.523 3.356.83 4.73c.116.443-.35.809-.746.592L8 13.187l-4.389 2.256z"/>
  </svg>
);

const HalfStar = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <linearGradient id="half">
        <stop offset="50%" stopColor="#FFD71B" />
        <stop offset="50%" stopColor="#EDEDF1" />
      </linearGradient>
    </defs>
    <path fill="url(#half)" d="M8 12.146L12.389 14.4c.396.217.862-.149.746-.592l-.83-4.73 3.523-3.356c.33-.315.158-.888-.283-.95l-4.898-.696L8.5.803a.502.502 0 0 0-.927 0L5.425 5.176 1.527 5.872c-.441.062-.613.635-.283.95l3.523 3.356-.83 4.73c-.116.443.35.809.746.592L8 12.146z"/>
  </svg>
);

const EmptyStar = () => (
    <svg width="16" height="16" viewBox="0 0 16 16">
       <path fill="#EDEDF1" d="M3.612 15.443c-.396.217-.862-.149-.746-.592l.83-4.73-3.523-3.356c-.33-.315-.158-.888.283-.95l4.898-.696 2.148-4.373c.197-.403.73-.403.927 0l2.148 4.373 4.898.696c.441.062.613.635.283.95l-3.523 3.356.83 4.73c.116.443-.35.809-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  );
  
  
  

export const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <>
      {Array.from({ length: fullStars }, (_, index) => (
        <FullStar key={`full-${index}`} />
      ))}
      {Array.from({ length: halfStars }, (_, index) => (
        <HalfStar key={`half-${index}`} />
      ))}
      {Array.from({ length: emptyStars }, (_, index) => (
        <EmptyStar key={`empty-${index}`} />
      ))}
    </>
  );
};
