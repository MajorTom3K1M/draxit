import React from 'react';

export const GameContainer = (props) => {
    return (
        <div className={`lobby-container game-container ${props.className || ''}`}>
            {props.children}
        </div>
    )
};