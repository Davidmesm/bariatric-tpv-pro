
import React from "react"
import {
    Avatar, Box, Button, Container,
    CssBaseline, Divider, makeStyles, Typography
} from "@material-ui/core"
import { LockOutlined } from "@material-ui/icons"
import { useForm } from "react-hook-form"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert } from "@material-ui/lab"
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext"
import { useHistory } from "react-router"
import { Link } from "react-router-dom"

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const schema = yup.object().shape({
    email: yup.string().required("Usuario requerido"),
    password: yup.string().required("Contraseña requerida")
});

const LoginPage = () => {
    const classes = useStyles()
    const { signIn, setCurrentUser } = useAuth()
    const history = useHistory()

    const { control, handleSubmit, setError,
        formState: { errors } } = useForm({resolver: yupResolver(schema)})

    const onSubmit = (data) => {
        signIn(data.email, data.password)
        .then((user) => {
            setCurrentUser(user)
            history.push("/")
        })
        .catch(error => {
            let currentError = getError(error)
            setError("login", {
                type: "firebase-error", 
                message: currentError})
            console.error(error)
        })
    }

    const getError = (error) => {
        switch(error.code)
        {
            case "auth/user-not-found":
                return "Usuario Incorrecto"
            case "auth/wrong-password":
                return "Contraseña Invalida"
            default:
                return "Error Desconocido"
        }
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    return (
        <Box display="flex">
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>
                    <br/>
                    {
                        (errors && errors.login) &&
                        <Alert severity="error">
                            {errors.login.message}
                        </Alert>
                    }
                    <form className={classes.form} onSubmit={handleSubmit(onSubmit, onError)}>
                        <TextFieldInput
                            name="email"
                            label="Usuario"
                            control={control}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            autoComplete="email"
                            autoFocus />
                        <TextFieldInput
                            name="password"
                            label="Contraseña"
                            control={control}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            type="password"
                            autoComplete="current-password" />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            className={classes.submit}>
                            Entrar
                        </Button>
                        <br/>
                        <br/>
                        <Divider />
                        <br/>
                        <Typography variant="h6" align="center">
                            ¿Olvidaste tu contraseña? <Link to="/reset-password">Reiniciar</Link>
                        </Typography>
                    </form>
                </Box>
            </Container>
        </Box>
    );
}

export default LoginPage
