import React from "react";
import { Box, Button, Container } from "@material-ui/core";
import { Add, Remove } from "@material-ui/icons";

import StudentList from "./StudentList";
import UserInfo from "./UserInfo";

const DEFAULT_USER = { uid: -1, name: "No Name Provided" };

const StudentView = props => {
  const {user, users} = props;

  const handleJoinQueue = () => {
    const msg = { type: "action", action: "add", value: user };
    props.ws.send(JSON.stringify(msg));
  };
  const handleLeaveQueue = () => {
    const msg = { type: "action", action: "remove", value: user };
    props.ws.send(JSON.stringify(msg));
  };

  return (
    <Container maxWidth="sm">
      <h1>2200 Office Hours Queue</h1>
      {user && (
        <UserInfo
          user={user}
          defaultUser={DEFAULT_USER}
          updateFunction={props.userUpdateFunction}
        />
      )}
      <StudentList users={users} />
      <Box display="flex" flexDirection="row" justifyContent="center">
        <Box p={1}>
          <Button
            onClick={handleJoinQueue}
            color="primary"
            variant="contained"
            startIcon={<Add />}
          >
            Join Queue
          </Button>
        </Box>
        <Box p={1}>
          <Button
            onClick={handleLeaveQueue}
            color="secondary"
            variant="contained"
            startIcon={<Remove />}
          >
            Leave Queue
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentView;
