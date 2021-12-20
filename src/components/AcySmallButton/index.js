import React, { useEffect, useState } from 'react';
import styles from './styles.less';

const AcySmallButton = (
  { children, onClick, disabled, color, textColor, borderColor, borderRadius, padding, width }
) => (
  <button
    type="button"
    style={{
      flex: '1',
      background: disabled?"#000000":String(color),
      color: { textColor },
      fontWeight: '600',
      border: `solid 1px ${disabled?"#000000":borderColor}`,
      borderRadius: String(borderRadius),
      paddingTop: String(padding),
      paddingBottom: String(padding),
      paddingLeft: '15px',
      paddingRight: '15px',
      cursor: 'pointer',
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const AcySmallButtonGroup = ({ activeButton, buttonList, containerClass, theme }) => {
  const [colorList, setColorList] = useState(buttonList.map((button, index) => index === 0 ? theme : "#1B1B1C"))

  useEffect(() => {
    setColorList((prevState) => prevState.map((color, index) => index === activeButton ? theme : "#1B1B1C"))
  }, [activeButton])

  return (
    <div className={containerClass}>
      {buttonList.map(([text, onClick, disabled], index) => {
        let borderRadius = '0 0 0 0'
        if (index === 0) {
          borderRadius = '.5rem 0 0 .5rem'
        } else if (index === buttonList.length - 1) {
          borderRadius = '0 .5rem .5rem 0'
        }
        return (
          <AcySmallButton
            color="#1B1B1C"
            textColor="white"
            borderColor={colorList[index]}
            borderRadius={borderRadius}
            padding="5px"
            onClick={onClick}
            id={index}
            disabled={disabled}
            width={index==4? '10%' : '20'}
          >
            {text}
          </AcySmallButton>
        )
      })}
    </div>
  )
}

export default AcySmallButton;

export { AcySmallButtonGroup }
