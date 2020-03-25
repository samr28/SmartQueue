import React, { useState } from "react";
import { TextField } from "@material-ui/core";
import { Edit, Check } from "@material-ui/icons";

const UserInfo = props => {
  const [isEdit, setIsEdit] = useState(false);
  const [userName, setUserName] = useState(props.user.name);

  const handleTextboxUpdate = event => {
    setUserName(event.target.value);
  };

  return (
    <div>
      {!isEdit && (
        <h4>
          {props.user.name} (uid: {props.user.uid}){" "}
          <Edit
            onClick={() => {
              setIsEdit(true);
            }}
            fontSize="small"
          />
        </h4>
      )}
      {isEdit && (
        <div>
          <TextField
            value={userName === props.defaultUser.name ? "" : userName}
            onChange={handleTextboxUpdate}
            label="Name"
            variant="outlined"
            size="small"
          />
          <Check
            onClick={() => {
              const newUser = {};
              Object.assign(newUser, props.user);
              newUser.name = userName;
              props.updateFunction(newUser);
              setIsEdit(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserInfo;
