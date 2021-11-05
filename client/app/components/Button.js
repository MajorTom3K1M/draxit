import React, { useRef } from 'react';

export const Button = ({ onClick, className, disabled, style, children, ...props }) => {
    const buttonRef = useRef(null);
    const onButtonClick = async () => {
        try {
            buttonRef.current.setAttribute("disabled", "disabled");
            if(onClick) {
                await onClick();
            }
        } catch (err) {
            buttonRef.current.removeAttribute("disabled");
        }
    }
    return (
        <button 
            disabled={disabled}
            className={className} 
            style={style}
            ref={buttonRef} 
            onClick={                    
                !disabled ? onButtonClick :
                () => {}
            }
        >
                {children}
        </button>
    )
}