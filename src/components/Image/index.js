import React, {useState} from 'react';
import {Image} from 'react-native';

export const ImageComponent = ({style, source, ...props}) => {
  const [loading, setLoading] = useState(true);

  const [isError, setIsError] = useState(false);

  return (
    <Image
      source={
        loading || isError ? require('../../assets/images/default.png') : source
      }
      onLoadEnd={() => setLoading(false)}
      {...props}
      style={style}
      onError={() => setIsError(true)}
    />
  );
};
