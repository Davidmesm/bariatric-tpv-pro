import { Box, CssBaseline } from '@material-ui/core'
import React from 'react'
import AppBar from './appLayout/AppBar'
import AppMenu from './appLayout/AppMenu'

const AppLayout = ({ children }) => {
    return (
        <Box display="flex">
            <CssBaseline />
            <AppBar />
            <AppMenu />
            {children}
        </Box>
    )
}

export default AppLayout
