import React, { useState, useCallback } from "react";
import styled from "styled-components";
import styles from "./styles.less";

const StyledInput = styled.input`
  font-size: 24px;
  background-color: inherit;
  color: white;
  width: 90%;
  border-width: 1px;
  line-height: 50px;
  border-right: 0px solid transparent;
  border-top: 0px solid transparent;
  border-left: 0px solid transparent;
  &:focus {
    outline-width: 0;
    filter: brightness(2);
  }
`;

const inputEmail = () => {
  let [active, setActive] = useState(false);
  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [hasError, setHasError] = useState(false);
  let [errorMsg, setErrorMsg] = useState("An error occured");
  let [success, setSuccess] = useState(false);

  return (
    <div className={styles.ticketBox}>
      {success ? (
        <span> Thank you for signing up!</span>
      ) : (
        <h1>Follow Telegram</h1>
      )}
    </div>
  );
};

export default inputEmail;