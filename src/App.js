import React from "react"
import AuthProvider from "./contexts/AuthContext"
import LoginPage from "./pages/auth/LoginPage"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import AlertsProvider from "./contexts/AlertsContext"
import PrivateRoute from "./components/PrivateRoute"
import ResetPassword from "./pages/auth/ResetPassword"
import MainPage from "./pages/MainPage"
import AppConfigProvider from "./contexts/AppConfigContext"
import ClientProvider from "./contexts/ClientContext"

const App = () => {
  return (
    <Router>
      <AppConfigProvider>
        <AlertsProvider>
          <AuthProvider>
            <ClientProvider>
              <Switch>
                <PrivateRoute exact path="/" component={MainPage} />
                <PrivateRoute path="/client" component={MainPage} />
                <PrivateRoute path="/sale" component={MainPage} />
                <PrivateRoute path="/vendor" component={MainPage} />
                <PrivateRoute path="/catalog" component={MainPage} />
                <PrivateRoute path="/product" component={MainPage} />
                <PrivateRoute path="/inventory" component={MainPage} />
                <PrivateRoute path="/commission" component={MainPage} />
                <PrivateRoute path="/delivery" component={MainPage} />
                <PrivateRoute path="/developer" component={MainPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/reset-password" component={ResetPassword} />
              </Switch>
            </ClientProvider>
          </AuthProvider>
        </AlertsProvider>
      </AppConfigProvider>
    </Router>
  )
}

export default App
