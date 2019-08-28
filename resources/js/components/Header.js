import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {Link} from 'react-router-dom';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },

};

function Header(props) {
    const { classes } = props;
    console.log(props.login);
    return (
        <div className={classes.root}>
            <AppBar position="static" style={{ background: '#007784' }}>
                <Toolbar>
                    <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" className={classes.grow}>
                        Company management in Laravel and React
                    </Typography>
                    { props.login ?
                        <a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/logout/" onClick={window.localStorage.clear()}>Logout</a> :
                        <ul className="nav navbar-nav navbar-right">
                            <li><a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/login/">Login</a></li>
                            <li><a style={{ color: 'white', fontSize: '1.25em', fontFamily: "Roboto", fontWeight: 500, lineHeight: 1.6 }} href="/register/">Register</a></li>
                        </ul>
                    }
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default withStyles(styles)(Header);
