import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TAView from "./TAView";
import StudentView from "./StudentView";

let ws = new WebSocket("ws://localhost:8888/");
const WS_RETRY_TIME = 5000;

toast.configure({ draggable: false, autoClose: 8000 });

const DEFAULT_USER = { uid: -1, name: "No Name Provided" };

function App() {
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

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
          console.log("WS - successfully connected");
        }
      } else if (ws.readyState === WebSocket.OPEN) {
        console.log("WS - successfully connected, attaching handlers");
        attachWSHandlers(ws);
        // Set manually here because handlers weren't connected in time to catch open
        setWsConnected(true);
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
      setWsConnected(true);
    });
    client.addEventListener("close", function(event) {
      console.log("WS Close");
      setWsConnected(false);
      wsReconnect();
    });
    client.addEventListener("message", function(event) {
      const msg = JSON.parse(event.data);
      // console.log("\\/ WS MSG \\/");
      console.log(event);
      // console.log("/\\ WS MSG /\\");
      if (msg.type === "queue") {
        if (!Array.isArray(msg.value)) {
          console.log("WS ERROR: queue not array");
          setUsers([]);
        } else {
          const newUsers = msg.value;
          setUsers(newUsers);
        }
      } else if (msg.type === "notification") {
        // Check to make sure msg is correct
        let notifContent = msg.notifContent;
        if (!notifContent) {
          console.log("Missing notifcontent");
          return;
        }
        let n = new Notification(notifContent.title, {
          body: notifContent.body || ""
        });
        n.onclick = () => {
          console.log("Notif click, goto: " + notifContent.link);
          window.open(notifContent.link, "_blank");
        };
        toast.success(notifContent.title);
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

  // Update websocket record in backend
  useEffect(() => {
    // Make sure user is set and websocket is connected
    if (user && wsConnected) {
      ws.send(
        JSON.stringify({
          type: "updateid",
          uid: user.uid
        })
      );
    }
  }, [user, wsConnected]);

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
    Notification.requestPermission().then(function(result) {
      console.log("Notif request perm: " + result);
      if (result !== "granted") {
        toast.error("Please allow notifications and refresh the page!");
      }
    });
  }, []);

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
