    import React, { Component } from 'react';
    import { Controlled as CodeMirror } from 'react-codemirror2';
    import Pusher from 'pusher-js';
    import pushid from 'pushid';
    import axios from 'axios';
    import AppBar from '@material-ui/core/AppBar'
    import './App.css';
    import 'codemirror/lib/codemirror.css';
    import 'codemirror/theme/material.css';
    import 'codemirror/mode/htmlmixed/htmlmixed';
    import 'codemirror/mode/css/css';
    import 'codemirror/mode/javascript/javascript';
    import { Helmet } from 'react-helmet'
    class App extends Component {
      //theme1="";
      constructor() {
        super();
        this.state = {
          id: "",
          html: "",
          css: "",
          js: ""
        };

        this.pusher = new Pusher("25d857e672adda2b50e0", {
          cluster: "ap2",
          forceTLS: true
        });

        this.channel = this.pusher.subscribe("editor");
      }

      componentDidUpdate() {
        this.runCode();
      }

      componentDidMount() {
        this.setState({
          id: pushid()
        });

        this.channel.bind("code-update", data => {
          const { id } = this.state;
          if (data.id === id) return;

          this.setState({
            html: data.html,
            css: data.css,
            js: data.js,
          });
        });
      }
      syncUpdates = () => {
        const data = { ...this.state };

        axios
          .post("http://localhost:5000/update-editor", data)
          .catch(console.error);
      };
      // handlechange(){
      //   this.theme1="material"
      //   this.componentDidUpdate();
      // }
      runCode = () => {
        const { html, css, js } = this.state;

        const iframe = this.refs.iframe;
        const document = iframe.contentDocument;
        const documentContents = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
            <style>
              ${css}
            </style>
          </head>
          <body>
            ${html}

            <script type="text/javascript">
              ${js}
            </script>
          </body>
          </html>
        `;

        document.open();
        document.write(documentContents);
        document.close();
      };

      render() {
        const { html, js, css } = this.state;
        const codeMirrorOptions = {
          theme: "material",
          lineNumbers: true,
          scrollbarStyle: null,
          lineWrapping: true
        };
        return (
          <div className="App">
             <Helmet>
                <title>Live Web</title>
              </Helmet>
            <AppBar  className="bar">
              <h3 className="content">Live Web</h3>
                  {/* <label class="switch" >
                  <input type="checkbox" onChange={this.handlechange}/>
                  <span class="slider round"></span>
                </label> */}
            </AppBar>
            <section className="area">
              <div className="editor html-code">
                <div className="header">HTML</div>
                <CodeMirror
                  value={html}
                  options={{
                    mode: "htmlmixed",
                    ...codeMirrorOptions
                  }}
                  onBeforeChange={(editor, data, html) => {
                    this.setState({ html }, () => this.syncUpdates()); // update this line
                  }}
                />
              </div>
              <div className="editor css-code">
                <div className="header">CSS</div>
                <CodeMirror
                  value={css}
                  options={{
                    mode: "css",
                    ...codeMirrorOptions
                  }}
                  onBeforeChange={(editor, data, css) => {
                    this.setState({ css }, () => this.syncUpdates()); // update this line
                  }}
                />
              </div>
              <div className="editor js-code">
                <div className="header">JavaScript</div>
                <CodeMirror
                  value={js}
                  options={{
                    mode: "javascript",
                    ...codeMirrorOptions
                  }}
                  onBeforeChange={(editor, data, js) => {
                    this.setState({ js }, () => this.syncUpdates()); // update this line
                  }}
                />
              </div>
            </section>
            <section className="result">
              <iframe title="result" className="iframe" ref="iframe" />
            </section>
          </div>
        );
      }
    }

    export default App;