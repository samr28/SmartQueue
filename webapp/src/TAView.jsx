import React, { useEffect, useState } from "react";
import { Container, TextField } from "@material-ui/core";
import Cookies from "js-cookie";

import StudentList from "./StudentList";

const TAView = props => {
  const [meetingLink, setMeetingLink] = useState(null);

  const handleTextboxUpdate = event => {
    setMeetingLink(event.target.value);
    Cookies.set("ta", { meetingLink: meetingLink });
  };

  const notifyFunction = user => {
    const notifContent = {
      title: props.user.name + " is ready to help you",
      body: "Click here to open the videochat",
      link: meetingLink
    }
    const msg = {
      type: "action",
      action: "sendnotif",
      value: user,
      notifContent: notifContent
    };
    props.ws.send(JSON.stringify(msg));
  };

  const removeUser = user => {
    const msg = { type: "action", action: "remove", value: user };
    props.ws.send(JSON.stringify(msg));
  };

  useEffect(() => {
    if (!Cookies.get("ta")) {
      console.log("no c");
      Cookies.set("ta", { meetingLink: null });
    } else {
      const ta = JSON.parse(Cookies.get("ta"));
      setMeetingLink(ta.meetingLink);
    }
  }, []);
  return (
    <Container maxWidth="sm">
      <h1>2200 TA</h1>
      <TextField
        value={meetingLink || ""}
        onChange={handleTextboxUpdate}
        label="Meeting link"
        variant="outlined"
        size="small"
      />
      <StudentList
        users={props.users}
        admin={true}
        notifyFunction={notifyFunction}
        removeUserFunction={removeUser}
      />
    </Container>
  );
};

export default TAView;
