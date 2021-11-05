import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Home } from "./components/Home";
import { Room } from "./components/Room";
import { GameContainer } from "./components/GameContainer";
import { Button } from "./components/Button";

const App = () => {
    const history = useHistory();

    return (
        <Switch>
            <Route exact path="/">
                <Home history={history} />
            </Route>
            <Route exact path="/rooms/:id">
                <Room history={history} />
            </Route>
            <Route exact path="/test">
                <GameContainer className="display-default">
                    <span className="title">Reveal</span>
                    <div className="frame">
                        <button className="custom-btn">aaaaaaaaaaaa ✔️</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                        <button className="custom-btn">Read More</button>
                    </div>
                    <span className="title">Cards</span>
                    <div className="frame" style={{ paddingBottom: '50px' }}>
                        <div className="card-container">
                            <img className="not-selected img-correct" src={'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'}/>
                            Correct:
                            <div className="name-list correct">jakkarin, mike, sibn, dsafgas, dgdsadasdasdasdas,fsafasfsafsa,fsafasfasfas,fasfasfasf,asfasfsa</div>
                        </div>
                        <div className="card-container">
                            <img className="not-selected" src={'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'}/>
                            <div className="name-list">csacsacasa</div>
                        </div>
                        <div className="card-container">
                            <img className="not-selected" src={'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'}/>
                            <div className="name-list"></div>
                        </div>
                        <div className="card-container">
                            <img className="not-selected" src={'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'}/>
                            <div className="name-list"></div>
                        </div>
                        <div className="card-container">
                            <img className="not-selected" src={'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg'}/>
                            <div className="name-list"></div>
                        </div>
                    </div>
                    <Button className="submit-btn">
                            Continue
                    </Button>
                </GameContainer>
            </Route>
            {/* <Playboard />  */}
            {/* <Waiting /> */}
            {/* <Toolbar {...toolbarProps} />
            <Canvas width={state.currentWidth} canvasRef={canvas} init={init} /> */}
        </Switch>
    )
};

export default App;