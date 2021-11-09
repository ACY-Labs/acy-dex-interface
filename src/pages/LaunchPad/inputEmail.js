import React, { useState, useCallback } from "react";
import FollowTelegram from "./FollowTelegram";
import styled from "styled-components";
import styles from "./styles.less";
import submit from "@/assets/icon_arrow_submit.svg";
import hsubmit from "@/assets/icon_arrow_submit_hover.svg";

const StyledInput = styled.input`
  font-size: 15px;
  background-color: inherit;
  color: black;
  width: 95%;
  border-width: 1px;
  align-self: center;
  line-height: 30px;
  border-right: 0px solid transparent;
  border-top: 0px solid transparent;
  border-left: 0px solid transparent;
  &:focus {
    outline-width: 0;
    filter: brightness(75%);
  }
`;

const inputEmail = () => {
  let [active, setActive] = useState(false);
  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [hasError, setHasError] = useState(false);
  let [errorMsg, setErrorMsg] = useState("An error occured");
  let [success, setSuccess] = useState(false);

  // api
  let subscribe = useCallback(() => {
    setHasError(false);
    console.log("Subscribe!");
    if (!name.length || !email.length) {
      setHasError(true);
      setErrorMsg("Fields cannot be empty");
      return;
    }
    // eslint-disable-next-line no-undef
    axios
      .post("/api/subscribe/add", {
        name,
        email,
      })
      .then((res) => {
        setHasError(false);
        setSuccess(true);
      })
      .catch((e) => {
        setHasError(true);
        setErrorMsg(e.response.data || "Error");
      });
  }, [name, email]);

  let nextPage = () => setSuccess(() => true)

  const errorText = {
    color:'#e53e3e',
    fontFamily:'Inter, sans-serif'
  }

  return (
    <div className={styles.emailContainer}>
      {success ? (
        <FollowTelegram />
      ) : (
        <div>
          <div className={styles.emailBox}>
            <div>
              <StyledInput value={name} required placeholder="Full Name" onChange={(e) => { setName(e.target.value);}} />
            </div>
            <div>
              <StyledInput required placeholder="Email Address" value={email} onChange={(e) => { setEmail(e.target.value);}} />
            </div>
            {hasError && <small className={errorText}>{errorMsg}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default inputEmail;