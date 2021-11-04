import React from 'react';

export const Lobby = (props) => {
    return (
        <div className="lobby-container">
            <div className="game-title">ONLINE DRAWING DIXIT</div>
            {props.children}
            <div className="game-info">
                Based on original Dixit but you draw the Cards
            </div>
        </div>
    )
};

