import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './CredentialsForm.css';

class CredentialsForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let loginForm = null;
    if (this.props.token == null) {
      loginForm = <form className="login-form" onSubmit={this.props.submitAction}>
        <input class="usernameInput" type="text" ref="usernameInput" />
        <input type="password" ref="password" />
        <input type="submit" ref="submit" />
      </form>;
    }
    return (
      <div>
        {loginForm}
      </div>
    );
  }
}

export default CredentialsForm;