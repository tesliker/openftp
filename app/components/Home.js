// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import $ from "jquery";
import { Client } from 'ssh2';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      dir: '',
      sshSettings: null,
      token: null,
      loggedIn: false,
      username: '',
      password: '',
      addAccount: 'false',
      listAccounts: 'false',
      addHost: '',
      addPort: '',
      addUsername: '',
      addPassword: '',
      addTitle: '',
      accounts: {},
      userUUID: '',
      activeAccount: {},
      activeNid: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.goBack = this.goBack.bind(this);
    this.returnFalse = this.returnFalse.bind(this);
    this.dragDrop = this.dragDrop.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.addAccount = this.addAccount.bind(this);
    this.grabAccounts = this.grabAccounts.bind(this);
  }
  componentDidMount() {
    let self = this;
    let token = localStorage.getItem('token');
    let username = localStorage.getItem('username');
    let uuid = localStorage.getItem('uuid');
    if (uuid.length > 0) {
      this.setState({userUUID: uuid});
    }
    if (token.length > 0 && username.length > 0) {
      this.setState({'token': token, 'username': username});
    }
    $.ajax({
      url: 'http://drupal8.docksal/jsonapi/user/user?filter[user-name][condition][path]=name&filter[user-name][condition][value]=' + this.state.username + '&filter[user-name][condition][operator]==',
      type: 'get',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': 'Basic ' + token
      },
      dataType: 'json',
      success: function (data) {
        if (data.data.length > 0) {
          self.setState({loggedIn: true});
        }
      }
    }); 
  }
  inputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  logIn() {
    let self = this;
    let token = btoa(this.state.username + ':' + this.state.password);
    this.setState({'token': token});
    localStorage.setItem('token', token);
    localStorage.setItem('username', this.state.username);
    $.ajax({
      url: 'http://drupal8.docksal/jsonapi/user/user?filter[user-name][condition][path]=name&filter[user-name][condition][value]=' + this.state.username + '&filter[user-name][condition][operator]==',
      type: 'get',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': 'Basic ' + token
      },
      dataType: 'json',
      success: function (data) {
        if (data.data.length > 0) {
          if (data.data[0]['attributes']['uuid'].length > 0) {
            console.log(data);
            self.setState({userUUID: data.data[0]['attributes']['uuid']});
            localStorage.setItem('uuid', data.data[0]['attributes']['uuid']);
          }
          self.setState({loggedIn: true});
        }
      }
    });    
  }

  logOut() {
    console.log('hello');
    this.setState({loggedIn: false})
  }

  setTheState(state, value) {
    this.setState({[state]: value});
  }

  addAccount() {
    $.ajax({
      url: 'http://drupal8.docksal/jsonapi/node/ftp_account',
      type: 'post',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': 'Basic ' + this.state.token
      },
      data: JSON.stringify({
        "data": {
          "type": "node--open-ftp",
          "attributes": {
            "title": this.state.addTitle,
            "field_account_name": this.state.addTitle,
            "field_host": this.state.addHost,
            "field_username": this.state.addUsername,
            "field_password": this.state.addPassword,
            "field_port": this.state.addPort,
          }
        }
      }),
      dataType: 'json',
      success: function (data) {
      }
    });
    this.setState({addAccount: 'false'});
  }

  grabAccounts() {
    let self = this;
    this.setState({listAccounts: 'true'});
    console.log(this.state.userUUID);
    $.ajax({
      url: 'http://drupal8.docksal/jsonapi/node/ftp_account?filter[uid.uuid][value]=' + this.state.userUUID,
      type: 'get',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': 'Basic ' + this.state.token
      },
      dataType: 'json',
      success: function (data) {
        self.setState({accounts: data.data});
      }
    });    
  }

  setActiveAccount(nid) {
    let self = this;
    this.setState({activeNid: nid});
    $.ajax({
      url: 'http://drupal8.docksal/jsonapi/node/ftp_account?filter[nid][value]=' + nid,
      type: 'get',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'Authorization': 'Basic ' + this.state.token
      },
      dataType: 'json',
      success: function (data) {
        console.log(data.data);
        let account = {};
        account.title = data.data[0]['attributes']['field_account_name'];
        account.host = data.data[0]['attributes']['field_host'];
        account.username = data.data[0]['attributes']['field_username'];
        account.port = data.data[0]['attributes']['field_port'];
        account.password = data.data[0]['attributes']['field_password'];
        self.setState({activeAccount: account});
      }
    }); 
  }

  render() {
    var self = this;
    let loginMarkup = null;
    let addAccount = null;
    let addAccountForm = null;
    let listAccounts = null;
    let hideAccounts = null;
    let accounts = null;
    if (this.state.loggedIn === false) {
      loginMarkup = <div>
      <input type="text" name="username" value={this.state.username} onChange={this.inputChange} />
      <input type="password" name="password" value={this.state.password} onChange={this.inputChange} />
      <button onClick={this.logIn} className="login">Login</button>
      </div>
    }
    if (this.state.loggedIn === true && this.state.addAccount === 'false') {
      addAccount = <button onClick={() => this.setTheState('addAccount', 'true')}>Add Account</button>;
    }
    if (this.state.loggedIn === true && this.state.listAccounts === 'false') {
      listAccounts = <button onClick={this.grabAccounts}>List Accounts</button>;
    }
    if (this.state.loggedIn === true && this.state.listAccounts === 'true') {
      hideAccounts = <button onClick={() => this.setTheState('listAccounts', 'false')}>Hide Accounts</button>;
    }
    if (this.state.addAccount === 'true') {
      addAccountForm = <div>
      <label>Title: </label><input type="text" name="addTitle" value={this.state.addTitle} onChange={this.inputChange} /><br />
      <label>Host: </label><input type="text" name="addHost" value={this.state.addHost} onChange={this.inputChange} /><br />
      <label>Port: </label><input type="text" name="addPort" value={this.state.addPort} onChange={this.inputChange} /><br />
      <label>Username: </label><input type="text" name="addUsername" value={this.state.addUsername} onChange={this.inputChange} /><br />
      <label>Password: </label><input type="password" name="addPassword" value={this.state.addPassword} onChange={this.inputChange} /><br />
      <button onClick={this.addAccount} className="login">Add</button>
      <button onClick={() => this.setTheState('addAccount', 'false')} className="cancel">Cancel</button>
      </div>
    }
    if (this.state.listAccounts === 'true') {
      if (this.state.accounts.length > 0) {
        let accountsArray = [];
        for (let account of this.state.accounts) {
          if (account.attributes.nid === this.state.activeNid) {
            accountsArray.push(<li style={{color: 'yellow'}} onClick={() => this.setActiveAccount(account.attributes.nid)}>{account.attributes.title}</li>);
          } else {
            accountsArray.push(<li onClick={() => this.setActiveAccount(account.attributes.nid)}>{account.attributes.title}</li>);
          }
        }
        accounts = <ul>{accountsArray}</ul>;
      }
    }
    return ( 
      <div>
        {loginMarkup}
        {addAccount}
        {addAccountForm}
        {listAccounts}
        {hideAccounts}
        {accounts}
        <div onClick={this.handleClick.bind(this)}>
          Connect
        </div>
        <div onDragOver={this.returnFalse.bind(this)} onDragLeave={this.returnFalse.bind(this)} onDragEnd={this.returnFalse.bind(this)} onDrop={this.dragDrop.bind(this)} className={styles.editor}>
          <ul>
          {this.state.list.map(function(obj, i) {
              if (obj.attrs.mode == '16877') {
                return <li className={styles.clickable} onClick={(e) => self.changeDir(obj.filename)} key={i}>{obj.filename}</li>;
              } else {
                return <li className={styles.notClickable} key={i}>{obj.filename}</li>;
              }
          })}
          </ul>
        </div>
          <button onClick={(e) => self.goBack()}>Go Back</button>
          <button onClick={this.logOut}>Logout</button>
      </div>
    );
  }

  returnFalse(e) {
    e.preventDefault();
    return false;
  }

  dragDrop(e) {
    e.preventDefault();
    for (let f of e.dataTransfer.files) {

var self = this;
var remotePathToList = self.state.dir;

var conn = new Client();
conn.on('ready', function() {
    conn.sftp(function(err, sftp) {
         if (err) throw err;
         
        var fs = require("fs"); // Use node filesystem
        var readStream = fs.createReadStream( f.path );

    var segments = f.path.split('/');
    var fname = segments.slice(-1).pop();

        var writeStream = sftp.createWriteStream( remotePathToList + fname );

        writeStream.on('close',function () {
            alert('file transferred succesfully');

        });

        writeStream.on('end', function () {
            console.log( "sftp connection closed" );
            conn.close();
        });

        // initiate transfer of file
        readStream.pipe( writeStream );
    });
}).connect(this.state.activeAccount);




    }
    return false;
  }
  goBack() {
    var self = this;
    var ps = self.state.dir;

    var segments = ps.split('/');
    segments.pop();
    segments.pop();
    segments.push("/");
    var backUrl = segments.join('/');


    var conn = new Client();
    self.setState({'dir': backUrl});
    var remotePathToList = backUrl;
    conn.on('ready', function() {
    conn.sftp(function(err, sftp) {
         if (err) throw err;
         // you'll be able to use sftp here
         // Use sftp to execute tasks like .unlink or chmod etc
         sftp.readdir(remotePathToList, function(err, list) {
                if (err) throw err;
                // List the directory in the console
                self.setState({'list': list});
                // Do not forget to close the connection, otherwise you'll get troubles
                conn.end();
         });
    });
    }).connect(this.state.activeAccount); 
  }
  changeDir(e) {
    var self = this;
    var ps = self.state.dir;
    var conn = new Client();
    self.setState((prevState) => ({
      'dir': prevState.dir + e + '/'
    }));
    var remotePathToList = ps + e + '/';
    conn.on('ready', function() {
    conn.sftp(function(err, sftp) {
         if (err) throw err;
         // you'll be able to use sftp here
         // Use sftp to execute tasks like .unlink or chmod etc
         sftp.readdir(remotePathToList, function(err, list) {
                if (err) throw err;
                // List the directory in the console
                self.setState({'list': list});
                // Do not forget to close the connection, otherwise you'll get troubles
                conn.end();
         });
    });
    }).connect(this.state.activeAccount); 
  }

  handleClick() {
    var self = this;
    var conn = new Client();
    var remotePathToList = '/home/';
    self.setState({'dir': remotePathToList});
    conn.on('ready', function() {
    conn.sftp(function(err, sftp) {
         if (err) throw err;
         // you'll be able to use sftp here
         // Use sftp to execute tasks like .unlink or chmod etc
         sftp.readdir(remotePathToList, function(err, list) {
                if (err) throw err;
                // List the directory in the console
                self.setState({'list': list});
                // Do not forget to close the connection, otherwise you'll get troubles
                conn.end();
         });
    });
    }).connect(this.state.activeAccount);

  }
}

export default Home;
