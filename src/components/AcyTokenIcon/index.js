import { AcyIcon } from '@/components/Acy';
import React, { useState } from 'react';

function AcyTokenIcon(props) {
  const [isError, setIsError] = useState(false);

  return (
    <>
      {!isError ? (
        <img
          src={`https://storageapi.fleek.co/chwizdo-team-bucket/ACY Token List/${
            props.symbol === 'WETH' ? 'ETH' : props.symbol
          }.svg`}
          width={props.width || 20}
          height={props.width || 20}
          onError={() => setIsError(true)}
        />
      ) : (
        <AcyIcon name="unknown" width={props.width || 20} />
      )}
    </>
  );
}

export default AcyTokenIcon;
