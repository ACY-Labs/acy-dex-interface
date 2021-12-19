import React, { Component, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Button } from 'antd';
import styles from "./styles.less";

export default class HomePage extends Component {

  state = {
    // user: {},
    authenticated: false
  };

  componentDidMount() {
    // Fetch does not send cookies. So you should add credentials: 'include'
    fetch("http://localhost:3001/auth", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
      }
    })
      .then(response => {
        if (response.status === 200) return response.json();
        throw new Error("failed to authenticate user");
      })
      .then(responseJson => {
        this.setState({
          authenticated: true,
          // user: responseJson.user
        });
      })
      .catch(e => {
        this.setState({
          authenticated: false,
        });
      });
  }
  

  render() {
    const { authenticated } = this.state;
    const handleClick = () => {
      window.open("http://localhost:3001/auth/twitter", "_blank");
    };

    return (
      <div>
        <div>
          {!authenticated ? (
            <Button className={styles.taskBtn} onClick={handleClick} style={{backgroundColor: "#c6224e", width: 'auto', color: 'white', height: "2em", fontSize:'15px', display:'flex', justifyContent:'center', alignItems:'center'}}>Submit</Button> 
          ) : (
            <div>
              <h1>You have login succcessfully!</h1>
            </div>
          )}
        </div>
      </div>
    );
  }

  
}