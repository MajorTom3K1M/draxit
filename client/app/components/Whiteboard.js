import React from 'react';
import { usePainter } from '../hooks/usePainter';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';

export const Whiteboard = (props) => {
    const { story, submitCard, round } = props;
    const [{ canvas, isReady, ...state }, { init, handleSave, ...api }] = usePainter();
    const toolbarProps = { ...state, ...api };

    const submit = async () => {
        const image = await handleSave();
        await submitCard(image, round)
    }

    return (
        <>
            <div className='fullscreenDiv'>
                <div className="center"><span>Story :</span> {story}</div>
            </div>
            <Toolbar {...toolbarProps} submit={submit} />
            <Canvas width={state.currentWidth} canvasRef={canvas} init={init} />
        </>
    )
}

