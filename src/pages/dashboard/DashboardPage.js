import { Button } from '@material-ui/core'
import React from 'react'
import { useHistory } from 'react-router'
import AppLayout from '../../components/AppLayout'
import { useAlerts } from '../../contexts/AlertsContext'
import { useAuth } from '../../contexts/AuthContext'

const DashboardPage = () => {
    const { currentUser, signOut } = useAuth()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const handleLogOut = () => {
        signOut()
        .then(() => {
            createAlert("success", "Logout")
            history.push("/login")
        })
        .catch(error => {
            createAlert("error", "Error al salir")
            console.log(error)
        })
    }

    return (
        <AppLayout>
            {currentUser.email}
            <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={(e) => handleLogOut(e)}>
                Salir
            </Button>
        </AppLayout>
    )
}

export default DashboardPage
