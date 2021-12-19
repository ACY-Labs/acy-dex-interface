import { AcyIcon } from '@/components/Acy';
import React, { useState, useEffect } from 'react';

function AcyTokenIcon(props) {
  const [isError, setIsError] = useState(false);
  const [, update] = useState(0);

  useEffect(
    () => {
      update(1);
      setIsError(false);
    },
    [props.symbol]
  );

  return (
    <>
      {!isError ? (
        <img
          src={props.symbol}
          style={{
            width: props.width || 20,
            height: props.width || 20,
          }}
          onError={() => setIsError(true)}
        />
      ) : (
        <AcyIcon name="unknown" width={props.width || 20} />
      )}
    </>
  );
}

export default AcyTokenIcon;
