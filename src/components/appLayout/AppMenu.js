import React from 'react'
import clsx from 'clsx';
import { Box, Drawer, IconButton, List, 
    makeStyles, useTheme} from '@material-ui/core';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { AccountBalanceWallet, AllInbox, Ballot, ChevronLeft, ChevronRight, Dashboard, MonetizationOn, People, Storefront, SupervisedUserCircle, ViewList } from '@material-ui/icons';
import MenuItem from './MenuItem'

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
    },
}));

const AppMenu = () => {
    
    const { showMenu, toggleMenuShow } = useAppConfig();
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: showMenu,
                [classes.drawerClose]: !showMenu,
            })}
            classes={{
                paper: clsx({
                    [classes.drawerOpen]: showMenu,
                    [classes.drawerClose]: !showMenu,
                }),
            }}>
            <Box className={classes.toolbar}>
                <IconButton onClick={() => toggleMenuShow()}>
                    {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
            </Box>
            <List>
                <MenuItem to="/" title="Panel Principal" icon={<Dashboard fontSize="large"/>}/>
                <MenuItem to="/sale" title="Ventas" icon={<MonetizationOn fontSize="large"/>}/> 
                <MenuItem to="/delivery" title="Envios" icon={<AllInbox fontSize="large"/>}/> 
                <MenuItem to="/client" title="Clientes" icon={<People fontSize="large"/>}/>
                <MenuItem to="/vendor" title="Vendedores" icon={<SupervisedUserCircle fontSize="large"/>}/>
                <MenuItem to="/commission" title="Reporte Comisiones" icon={<AccountBalanceWallet fontSize="large"/>}/> 
                <MenuItem to="/product" title="Productos" icon={<Storefront fontSize="large"/>}/>
                <MenuItem to="/inventory" title="Inventarios" icon={<Ballot fontSize="large"/>}/>
                <MenuItem to="/catalog" title="Catalogo" icon={<ViewList fontSize="large"/>}/>  
            </List>
      </Drawer>
    )
}

export default AppMenu
