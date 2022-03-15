import React, { useContext, useEffect, useState } from 'react'

const AppConfigContext = React.createContext()

export const useAppConfig = () => {
    return useContext(AppConfigContext)
}

const AppConfigProvider = ({children}) => {
    const [showMenu, setShowMenu] = useState(true)
    const [appName, setAppName] = useState("")

    const toggleMenuShow = () => {
        setShowMenu(!showMenu)
    }

    const value = {
        appName,
        showMenu,
        toggleMenuShow
    }

    useEffect(() => {
        setAppName(process.env.REACT_APP_NAME)
    }, [])

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    )
}

export default AppConfigProvider
