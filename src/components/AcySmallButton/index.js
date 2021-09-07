import React, { useState, Children } from 'react';

function AcySmallButton (props) {
    const {children, onClick,disabled, color, textColor, borderColor, borderRadius, padding} = props;
    return (
        <button
            style={{
                background: String(color),
                color: {textColor},
                fontWeight:"600",
                border:`solid 1px ${borderColor}`,
                borderRadius: String(borderRadius),
                paddingTop: String(padding),
                paddingBottom: String(padding),
                paddingLeft: "15px",
                paddingRight: "15px"
            }}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default AcySmallButton;