import React, { useState, useEffect } from 'react';
import { Lobby } from './Lobby';
import { api } from '../services/LobbyAPI';
import { Button } from './Button'

export const Home = (props) => {
    const { history } = props;
    const maxNameLength = 12;
    const roomIDLength = 6;
    
    const [room, setRoom] = useState("");
    const [jName, setJName] = useState("");
    const [cName, setCName] = useState("");
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        let timer;
        if (history.location.state && history.location.state.invalidRoom) {
          setErrMsg("room does not exist!");
          // reset error message
          timer = setTimeout(() => {
            setErrMsg("");
            history.replace();
          }, 4000);
        }
        return () => {
          clearTimeout(timer);
        };
    }, [history]);

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

    const saveInfo = (name, roomId, playerId) => {
        localStorage.setItem("name", name);
        localStorage.setItem("id", roomId);
        localStorage.setItem("playerId", playerId);
    };

    const joinRoom = async (roomId, playerName, isRoomOwner = false) => {
        try {
            const players = await api.getPlayers(roomId).catch((err) => {
                setErrMsg("room does not exist!");
                timer = setTimeout(() => {
                  setErrMsg("");
                }, 4000);
            });
            const uniqueName = players
                .filter((player) => player.name)
                .map((player) => player.name)
                .indexOf(playerName) === -1;
            if (uniqueName) {
                api.joinRoom(roomId, playerName, isRoomOwner).then((info) => {
                    saveInfo(playerName, roomId, info.player._id);
                    history.push("/rooms/" + roomId);
                }).catch(() => {
                    setErrMsg("room does not exist!");
                    setJName("");
                    document.getElementById("joinName").value = "";
                })
            } else {
                setErrMsg("name already taken!");
                setJName("");
                document.getElementById("joinName").value = "";
            }
        } catch(err) {

        }
    }

    const createRoom = async () => {
        await api.createRoom().then((roomId) => {
            joinRoom(roomId, cName, true);
        }) 
    }

    return (
        <Lobby>
            <span className="title join-title">join game</span>
            <div className="input-info-area">
                <p style={{ margin: "0" }}>room id</p>
            </div>
            <input
                id="roomIdentification"
                type="text"
                maxLength={`${roomIDLength}`}
                spellCheck="false"
                autoComplete="off"
                onKeyDown={(e) => handleKeyDown(e)}
                onChange={(e) => setRoom(e.target.value)}
                className="input-field"
            />
            <div className="input-info-area">
                <p style={{ margin: "0" }}>your name</p>
            </div>
            <div className="user-input">
                <input
                    id="joinName"
                    type="text"
                    maxLength={`${maxNameLength}`}
                    spellCheck="false"
                    autoComplete="off"
                    onKeyDown={(e) => handleKeyDown(e, jName)}
                    onChange={(e) => setJName(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    className="input-field"
                />
            </div>
            <Button
                className="lobby-btn"
                disabled={room.length !== roomIDLength || jName.length === 0}
                onClick={() => joinRoom(room, jName)}
            >
                join
            </Button>
            <div className="error-msg">{errMsg}</div>
            <span className="title create-title">create lobby</span>
            <div className="input-info-area">
                <p style={{ margin: "0" }}>your name</p>
            </div>
            <div className="user-input">
                <input
                    type="text"
                    maxLength={`${maxNameLength}`}
                    spellCheck="false"
                    autoComplete="off"
                    onKeyDown={(e) => handleKeyDown(e, cName)}
                    onChange={(e) => setCName(e.target.value)}
                    onPaste={(e) => e.preventDefault()}
                    className="input-field"
                />
            </div>
            <Button className="lobby-btn" onClick={createRoom}>
                create
            </Button>
        </Lobby>
    )
}