import React from 'react';

export const Waiting = (props) => {
    const { text } = props;
    return (
        <div className="waiting-container">
            <div className="waiting-text">{text}</div>
        </div>
    );
};