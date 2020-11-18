import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useDispatch } from "react-redux";
import { useHistory, Link, useLocation } from "react-router-dom";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DashboardIcon from "@material-ui/icons/Dashboard";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import AssessmentIcon from "@material-ui/icons/Assessment";
import MenuIcon from "@material-ui/icons/Menu";
import {Typography, Grid} from "@material-ui/core";
import logo from '../components/HypeTypeLogo.v1.png';
import { setViewerToken } from "../../Viewer";
import { accentColor } from "../components";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  menuButton: {
    marginRight: -4,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7),
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }
}));

export function UserNavbar(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(setViewerToken(null));
    history.push("/");
  };

  return (
    <div className={classes.root}>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component={'span'}
            className={clsx({
              [classes.hide]: !open,
            })}
            style={{ marginRight: 30 }}
          >
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <img src={logo} alt="HypeTypeLogo" style={{height:25}}/>
              </Grid>
              <Grid item xs={6}>
                Hype Type
              </Grid>
            </Grid>
          </Typography>
          <IconButton
            onClick={handleDrawerClose}
            className={clsx({
              [classes.hide]: !open,
            })}
          >
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem button to="/" color="inherit" component={Link}>
            <ListItemIcon>
              <DashboardIcon
                style={{ color: location.pathname === "/" ? accentColor : "" }}
              />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button color="inherit" to="/challenge" component={Link}>
            <ListItemIcon>
              <KeyboardIcon
                style={{
                  color: location.pathname === "/challenge" ? accentColor : "",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Typing Challenge" />
          </ListItem>
          <ListItem button color="inherit" to="/arena" component={Link}>
            <ListItemIcon>
              <KeyboardIcon
                style={{
                  color: location.pathname === "/arena" ? accentColor : "",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Typing Arena" />
          </ListItem>
          <ListItem button color="inherit" to="/leaderboard" component={Link}>
            <ListItemIcon>
              <AssessmentIcon
                style={{
                  color:
                    location.pathname === "/leaderboard" ? accentColor : "",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Leaderboard" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button color="inherit" onClick={handleSignOut}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Drawer>
      {props.routes}
    </div>
  );
}
