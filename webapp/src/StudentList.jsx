import React from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@material-ui/core";
import { Clear, Notifications } from "@material-ui/icons";

const StudentList = props => {
  return (
    <div>
      <List>
        {!(
          props.users &&
          Array.isArray(props.users) &&
          props.users.length > 0
        ) && (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        )}

        {props.users &&
          Array.isArray(props.users) &&
          props.users.length > 0 &&
          props.users.map((u, i) => (
            <ListItem key={i}>
              <ListItemText
                primary={
                  // i + 1 + ". " + u.charAt(0).toUpperCase() + u.substring(1)
                  i + 1 + ". " + u.name + " (" + u.uid + ")"
                }
              />
              {props.admin && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="notification" onClick={() => {props.notifyFunction(u)}}>
                    <Notifications />
                  </IconButton>
                  <IconButton edge="end" aria-label="close" onClick={() => {props.removeUserFunction(u)}}>
                    <Clear color="secondary" />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default StudentList;
