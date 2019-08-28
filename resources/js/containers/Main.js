import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import Auth from './Auth';

export default class Main extends Component {

    render() {
        console.log(window.localStorage.getItem('accessToken'));
        if (window.localStorage.getItem('accessToken')) {
            return (
                <div>
                    <Auth />
                </div>
            );
        } else {
            return (
                <div>
                    <Home />
                </div>
            );
        }

    }
}

if (document.getElementById('root')) {
    ReactDOM.render(<Main />, document.getElementById('root'));
}
