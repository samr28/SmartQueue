import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Notification from "react-web-notification";
import Cookies from "js-cookie";

import TAView from "./TAView";
import StudentView from "./StudentView";

let ws = new WebSocket("ws://localhost:8888/");
const WS_RETRY_TIME = 5000;

const DEFAULT_USER = { uid: -1, name: "No Name Provided" };

function App() {
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(false);
  const [notifContent, setNotifContent] = useState(false);

  const genRandID = () => {
    return Math.floor(Math.random() * 1000);
  };

  const wsReconnect = () => {
    setTimeout(() => {
      console.log("WS - attempt reconnect");
      if (ws.readyState === WebSocket.CLOSED) {
        ws = new WebSocket("ws://localhost:8888/");
        if (ws.readyState !== WebSocket.OPEN) {
          console.log("WS - failed reconnect");
          wsReconnect();
        } else {
          console.log("WS - ssuccessfully connected");
        }
      } else if (ws.readyState === WebSocket.OPEN) {
        console.log("WS - successfully connected, attaching handlers");
        attachWSHandlers(ws);
        ws.send(JSON.stringify({ type: "request", value: "queue" }));
      }
    }, WS_RETRY_TIME);
  };

  const wsSend = msg => {
    ws.send(msg);
  };

  const attachWSHandlers = client => {
    client.addEventListener("open", function(event) {
      console.log("WS Open");
    });
    client.addEventListener("close", function(event) {
      console.log("WS Close");
      wsReconnect();
    });
    client.addEventListener("message", function(event) {
      const msg = JSON.parse(event.data);
      console.log("\\/ WS MSG \\/");
      console.log(event);
      console.log("/\\ WS MSG /\\");
      if (msg.type === "queue") {
        if (!Array.isArray(msg.value)) {
          console.log("WS ERROR: queue not array");
          setUsers([]);
        } else {
          const newUsers = msg.value;
          setUsers(newUsers);
        }
      } else if (msg.type === "notification") {
        setNotifContent(msg.notifContent);
        setNotification(true);
      } else if (msg.type === "ping") {
        let pingMsgResp = JSON.stringify({
          type: "pingres",
          timestamp: new Date(),
          id: msg.id
        });
        ws.send(pingMsgResp);
      }
    });
  };

  useEffect(() => {
    if (!Cookies.get("user")) {
      Cookies.set(
        "user",
        { uid: genRandID(), name: DEFAULT_USER.name },
        { expires: 7 }
      );
    }
    setUser(JSON.parse(Cookies.get("user")));
    attachWSHandlers(ws);
  }, []);

  const handleNotificationShow = () => {
    // Flip flag to remove component
    setNotification(false);
  };
  const handleNotificationClick = () => {
    // TODO: open webex
    console.log("Clicked notification");
    console.log(notifContent.link);
    window.open(notifContent.link, "_blank");
  };
  const handleNotificationClose = () => {
    // TODO: nothing I guess...
    console.log("Notif closed");
  };
  const handleNotificationError = () => {
    // TODO
    console.log("Failed notification");
  };

  /* TODO Notifications:
        - If device doesnt support notifications (prop: notSupported)
        - If user declines notifications (prop: onPermissionDenied, askAgain=true to request again)
        - props.options (body, tag, icon)
  */

  const updateUser = newUser => {
    console.log("NEW USER: ", newUser);
    Cookies.set("user", newUser, { expires: 7 });
    setUser(newUser);
  };

  return (
    <div>
      {notification && notifContent && (
        <Notification
          title={notifContent.title || ""}
          options={{ body: notifContent.body }}
          timeout={10000}
          onShow={handleNotificationShow}
          onClick={handleNotificationClick}
          onClose={handleNotificationClose}
          onError={handleNotificationError}
        />
      )}
      <Router>
        <Switch>
          <Route path="/ta">
            <TAView user={user} users={users} ws={ws} />
          </Route>
          <Route path="/">
            <StudentView
              user={user}
              users={users}
              userUpdateFunction={updateUser}
              wsSend={wsSend}
            />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
