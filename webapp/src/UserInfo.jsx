import React, { useState } from "react";
import { TextField } from "@material-ui/core";
import { Edit, Check } from "@material-ui/icons";

const UserInfo = props => {
  const [isEdit, setIsEdit] = useState(false);
  const [userName, setUserName] = useState(props.user.name);

  const handleTextboxUpdate = event => {
    setUserName(event.target.value);
  };

  const save = () => {
    const newUser = {};
    Object.assign(newUser, props.user);
    newUser.name = userName;
    props.updateFunction(newUser);
    setIsEdit(false);
  };

  return (
    <div>
      {!isEdit && (
        <h4 onClick={() => setIsEdit(true)}>
          {props.user.name} (uid: {props.user.uid}) <Edit fontSize="small" />
        </h4>
      )}
      {isEdit && (
        <div>
          <TextField
            value={userName === props.defaultUser.name ? "" : userName}
            onChange={handleTextboxUpdate}
            onBlur={save}
            label="Name"
            variant="outlined"
            size="small"
          />
          <Check onClick={save} />
        </div>
      )}
    </div>
  );
};

export default UserInfo;
