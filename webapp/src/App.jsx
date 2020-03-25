import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Notification from "react-web-notification";
import Cookies from "js-cookie";

import TAView from "./TAView";
import StudentView from "./StudentView";

const ws = new WebSocket("ws://localhost:8888/");

const DEFAULT_USER = { uid: -1, name: "No Name Provided" };

function App() {
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(false);
  const [notifContent, setNotifContent] = useState(false);

  const genRandID = () => {
    return Math.floor(Math.random() * 1000);
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

    ws.addEventListener("open", function(event) {
      console.log("WS Open");
    });
    ws.addEventListener("close", function(event) {
      console.log("WS Close");
    });
    ws.addEventListener("message", function(event) {
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
        console.log(msg);
        setNotifContent(msg.notifContent);
        setNotification(true);
      }
    });
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
              ws={ws}
            />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
