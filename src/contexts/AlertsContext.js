import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useContext, useState } from 'react'

const AlertsContext = React.createContext()

export const useAlerts = () => {
    return useContext(AlertsContext)
}

const AlertsProvider = ({ children }) => {
    const [open, setOpen] = useState(false)
    const [severity, setSeverity] = useState("info")
    const [message, setMessage] = useState("")

    const handleClose = () =>
    {
        setOpen(false);
    }

    const createAlert = (severity, message) => {
        if(open)
        {
            setOpen(false)
        }

        setSeverity(severity)
        setMessage(message)
        setOpen(true)
    }

    const value = {
        createAlert
    }

    return (
        <AlertsContext.Provider value={value}>
            {children}
            <Snackbar 
                open={open} 
                autoHideDuration={6000} 
                onClose={handleClose}
                anchorOrigin={{vertical:"top", horizontal:"right"}}>
                <Alert onClose={handleClose} severity={severity}>
                    { message }
                </Alert>
            </Snackbar>
        </AlertsContext.Provider>
    )
}

export default AlertsProvider
