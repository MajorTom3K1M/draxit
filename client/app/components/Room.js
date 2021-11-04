import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useParams } from "react-router-dom";
import { Lobby } from './Lobby';
import { socket } from '../services/Socket';
import { api } from '../services/LobbyAPI';
import { api as card } from '../services/CardAPI';
import { api as player } from '../services/PlayerAPI';
import { Waiting } from './Waiting';
import { GameContainer } from './GameContainer';
import { Whiteboard } from './Whiteboard';

export const Room = (props) => {
    let isStoryTeller;
    let thisPlayer;
    const { history } = props;
    const { id } = useParams();
    const [copied, setCopied] = useState(false);
    const [players, setPlayers] = useState([]);
    const [state, setState] = useState("lobby-waiting");
    const [story, setStory] = useState("");
    const [round, setRound] = useState(0);
    const [displayStory, setDisplayStory] = useState("");
    const [isReady, setIsReady] = useState(false);
    const [cards, setCards] = useState([]);
    const [selectCardId,setSelectCardId] = useState("")

    useEffect(() => {
        switch(state) {
            case "thinking-sentence":
                setIsReady(false);
                setSelectCardId("");
                setCards([]);
                setDisplayStory("");
                break;
            case "guessing":
                card.getCards(id, round).then((cards) => {
                    setCards(cards.sort((a,b) => a.sequence - b.sequence));
                });
                break;
            case "reveal":
                card.getCards(id, round).then((cards) => {
                    setCards(cards.sort((a,b) => a.sequence - b.sequence));
                })
        }
    }, [state]);

    useEffect(() => {
        socket.reJoin(() => {
            history.push("", { invalidRoom: true });
        })
        
        return async () => {
            await leaveRoom();
        }
    }, [history])

    useEffect(() => {
        if(players.length > 1 && state === 'drawing-card') {
            const isAllSubmit = players.filter((player) => player?.cards?.find((card) => card.round === round)).length === players.length;
            if(isAllSubmit) {
                const thisPlayerId = localStorage.getItem("playerId");
                const thisPlayer = players.find((player) => String(player._id) === String(thisPlayerId));
                if(thisPlayer?.isRoomOwner) {
                    api.setState(id, 'guessing', { round }).then(() => {
                        card.getCards(id, round).then((cards) => {
                            setCards(cards.sort((a,b) => a.sequence - b.sequence));
                        })
                    });
                }
            }
        }
    }, [players.filter((player) => player?.cards?.find((card) => card.round === round)).length]);

    useEffect(() => {
        if(players.length > 1 && state === 'guessing') {
            const isAllSelected = players.filter((player) => player?.isSelected && !player?.isStoryTeller).length === players.filter((player) => !player?.isStoryTeller).length;
            if(isAllSelected) {
                const thisPlayerId = localStorage.getItem("playerId");
                const thisPlayer = players.find((player) => String(player._id) === String(thisPlayerId));
                if(thisPlayer?.isRoomOwner) {
                    api.setState(id, 'reveal', { round }).then(() => {
                        card.getCards(id, round).then((cards) => {
                            setCards(cards.sort((a,b) => a.sequence - b.sequence));
                        })
                    });
                }
            }
        }
    }, [players.filter((player) => player?.isSelected && !player?.isStoryTeller).length]);

    useEffect(() => {
        if(players.length > 1 && state === 'reveal') {
            const isAllContinue = players.filter((player) => player?.isContinue).length === players.length;
            console.log({ isAllContinue  })
            if(isAllContinue) {
                const thisPlayerId = localStorage.getItem("playerId");
                const thisPlayer = players.find((player) => String(player._id) === String(thisPlayerId));
                if(thisPlayer?.isRoomOwner) {
                    api.setState(id, 'thinking-sentence');
                }
            }
        }
    }, [players.filter((player) => player?.isContinue).length]);

    useEffect(async () => {
        let mounted = true

        api.getPlayers(id).then((players) => {
            setPlayers(players.sort((a, b) => a.sequence - b.sequence));
        }).catch(() => {
            history.push("", { invalidRoom: true });
        });

        socket.getPlayers((players) => {
            if (mounted) {
                setPlayers(players.sort((a, b) => a.sequence - b.sequence))
            };
        });

        socket.getState((state) => {
            if (mounted) { 
                setState(state.gameState)
                if(state.story) setDisplayStory(state.story)
                if(state.round) setRound(state.round)
            }
        });

        return async () => {
            mounted = false
        }
    }, [state, players.length, id, history]);

    useEffect(() => {
        let timeout;
        if (copied) {
            timeout = setTimeout(() => {
                if (document.getSelection().toString() === id) {
                    document.getSelection().removeAllRanges();
                }
                setCopied(false);
            }, 3000);
        }

        return () => clearTimeout(timeout);
    }, [copied, id]);

    const handleKeyDown = (e, text) => {
        if (e.key === " ") {
          if (text) {
            if (text.length === 0 || text.substring(text.length - 1, text.length) === " ") {
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
        }
    };

    const copyToClipboard = (e) => {
        const textArea = document.getElementById("roomID");
        textArea.select();
        if (!navigator.clipboard){
            document.execCommand("copy");
        } else {
            navigator.clipboard.writeText(textArea.innerHTML);
        }
        e.target.focus();
        setCopied(true);
    };

    const leaveRoom = async () => {
        await api.leaveRoom(id, localStorage.getItem("playerId")).then(() => {
            history.push("/");
        });
    };

    const startGame = async () => {
        await api.startGame(id);
    }

    const submitStory = async (story) => {
        await api.setState(id, "drawing-card", { story });
    }

    const submitCard = async (image, round) => {
        const playerId = localStorage.getItem("playerId");
        await card.createCard(id, playerId, image, round).then(() => {
            setIsReady(true);
        });
    }

    const selectCard = async (cardId) => {
        const playerId = localStorage.getItem("playerId");
        await card.selectCard(id, cardId, playerId).then(() => {
            setSelectCardId(cardId);
        });
    }

    const clickContinue = async () => {
        const playerId = localStorage.getItem("playerId");
        await player.gameContinue(id, playerId).then(() => {
            socket.updatePlayers(id);
        });
    }

    switch(state) {
        case "reveal":
            thisPlayer = players.find((player) => player._id === localStorage.getItem("playerId"));
            return (
                <GameContainer className="display-default">
                    <span className="title">Reveal</span>
                    <div className="frame">
                        {players.map((player) => {
                            const isYou = thisPlayer._id === player._id;
                            return (<button className={isYou ? "custom-btn you" : "custom-btn" } key={player.name}>{player.name} {isYou?"(You)":""} {player.isStoryTeller ? "🧚" : ""}  {player.isContinue ? "✔️" : ""}</button>)
                        })}
                    </div>
                    <span className="title">Cards</span>
                    <div className="frame">
                        {cards.map((card, index) => {
                            const storyTellerId = players.find((player) => player?.isStoryTeller)?._id;
                            const storyTellersCardId = cards.find((card) => card.playerId === storyTellerId)?._id;
                            const isCorrectCard = storyTellersCardId === card._id;
                            return (
                                <div className={isCorrectCard ? "card-container correct" : "card-container"} key={index}>
                                    <img className={isCorrectCard ? "not-selected img-correct" : "not-selected"} src={`data:image/png;base64,${card.cardImage}`} />
                                    <div className={isCorrectCard ? "name-list correct" : "name-list"}>
                                        {card?.playerAnswers?.map((player) => player.name).join(", ")}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button className="submit-btn" onClick={clickContinue}>
                        Continue
                    </button>
                </GameContainer>
            )
        case "guessing":
            thisPlayer = players.find((player) => player._id === localStorage.getItem("playerId"));
            isStoryTeller = thisPlayer?.isStoryTeller;
            return (
                <GameContainer className="display-default">
                    <span className="title">{ isStoryTeller ? "You are storyteller Wait other guessing" : "Guessing" }</span>
                    <div className="frame">
                        {players.map((player) => {
                            const isYou = thisPlayer._id === player._id;
                            return (<button className={isYou ? "custom-btn you" : "custom-btn" } key={player.name}>{player.name} {isYou?"(You)":""} {player.isStoryTeller ? "🧚" : ""} {player.isSelected ? "✔️" : ""}</button>)
                        })}
                    </div>
                    <span className="title">Cards</span>
                    <div className="frame">
                        {cards.map((card, index) => {
                            const isSelected = selectCardId !== "";
                            const selected = card._id === selectCardId;
                            return (
                                <div className="card-container" key={index}>
                                    <img className={isStoryTeller ? "not-selected" : (isSelected ? (selected ? "selected" : "not-selected") : "")} src={`data:image/png;base64,${card.cardImage}`} onClick={() => selectCard(card._id)}/>
                                </div>
                            )
                        })}
                    </div>
                </GameContainer>
            );
        case "drawing-card":
            if(isReady) {
                return (
                    <Waiting text={`Waiting For Player That Still Drawing... (${players.filter((player) => player?.cards?.find((card) => card.round === round)).length}/${players.length})`} />
                );
            } else {
                return (
                    <Whiteboard story={displayStory} submitCard={submitCard} round={round} />
                )
            }
        case "thinking-sentence":
            isStoryTeller = players.find((player) => player._id === localStorage.getItem("playerId"))?.isStoryTeller;
            if(isStoryTeller) {
                return (
                    <GameContainer>
                        <span className="title">Input Your Story</span>
                        <input
                            id="roomIdentification"
                            placeholder="input your story here."
                            type="text"
                            spellCheck="false"
                            autoComplete="off"
                            className="story-input-field"
                            onKeyDown={(e) => handleKeyDown(e)}
                            onChange={(e) => setStory(e.target.value)}
                        />
                        <button className="submit-btn" onClick={() => submitStory(story)}>
                            Submit
                        </button>
                    </GameContainer>
                )
            } else {
                return (
                    <Waiting text='Waiting For Story Teller...' />
                )
            }
        case "lobby-waiting":
        default:
            return (
                <Lobby>
                    <span className="title room-title">Room</span>
                    <div className="players-list">
                        {players.map((player) => {
                            if (player.name) {
                                return player.name + `${player.name === localStorage.getItem("name") ? " (You)" : ""} ${player.isRoomOwner ? "👑" : ""}\n`;
                            } else {
                                return "...\n";
                            }
                        })}
                    </div>
                    <div className="room-info-area">
                        <div className="roomID-area">
          
                            room id:
                            <textarea id="roomID" value={id} readOnly />
                            <button
                                className={classNames("copy-btn", { "copied-btn": copied })}
                                onClick={copyToClipboard}
                                disabled={copied}
                            >
                                {copied ? "copied" : "copy"}
                            </button>
                        </div>
                        <div className="room-info">
                            You can click "START" when at least 4 players have joined. ( {players.length === 0 ? "" : ` ${players.length}`} have joined )
                        </div>
                        <button className="leave-btn" onClick={leaveRoom}>
                            leave
                        </button>
                        {" "}
                        <button className="leave-btn" disabled={players.length >= 2 ? false : true } style={players.find((player) => player._id === localStorage.getItem("playerId"))?.isRoomOwner ? {} : { display: 'none' }} onClick={startGame}>
                            start
                        </button>
                    </div>
                </Lobby>
            );
    }
}