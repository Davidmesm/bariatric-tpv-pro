import React, { useState } from "react"
import clsx from "clsx"
import {
    AppBar as UIAppBar, Toolbar, Typography, IconButton,
    Box, makeStyles, Menu, MenuItem
} from "@material-ui/core"
import { AccountCircle } from "@material-ui/icons"
import MenuIcon from "@material-ui/icons/Menu"
import { useHistory } from "react-router"
import { useAppConfig } from "../../contexts/AppConfigContext"
import { useAuth } from "../../contexts/AuthContext"
import { useAlerts } from "../../contexts/AlertsContext"

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
    menuButton: {
        marginRight: theme.spacing(2),
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
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
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up("sm")]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}))

const AppBar = () => {
    const classes = useStyles()
    const history = useHistory()
    const { signOut } = useAuth()
    const { appName, showMenu, toggleMenuShow } = useAppConfig()
    const { createAlert } = useAlerts()

    const [ anchorEl, setAnchorEl ] = useState(null)

    const open = Boolean(anchorEl)

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleSignOut = () => {
        signOut()
            .then(() => history.push("/"))
            .catch((error) => {
                console.error(error)
                createAlert("error", "Error al cerrar sesión.")
            })
    }

    return (
        <UIAppBar
            position="fixed"
            className={clsx(classes.appBar, {
                [classes.appBarShift]: showMenu,
            })}>
            <Toolbar>
                <IconButton
                    edge="start"
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="menu"
                    onClick={(e) => toggleMenuShow()}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    {appName}
                </Typography>
                <Box>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit">
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleSignOut}>Cerrar Sesión</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </UIAppBar>
    )
}

export default AppBar
