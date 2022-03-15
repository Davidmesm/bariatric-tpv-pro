import React, { useEffect } from "react"
import { Avatar, Box, Button, Container, CssBaseline, 
    Grid, makeStyles, Typography } from "@material-ui/core"
import { LockOpenOutlined } from "@material-ui/icons"
import * as yup from "yup"
import { useAlerts } from "../../contexts/AlertsContext"
import { useAuth } from "../../contexts/AuthContext"
import { useHistory } from "react-router"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Alert } from "@material-ui/lab"
import TextFieldInput from "../../components/inputs/TextFieldInput"

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
}))

const schema = yup.object().shape({
    email: yup.string().required("Usuario requerido")
})


const ResetPassword = (props) => {
    const { email } = props

    const classes = useStyles()
    const { resetPassword } = useAuth()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError, setValue,
        formState: { errors } } = useForm({ resolver: yupResolver(schema) })

    const onSubmit = (data) => {
        resetPassword(data.email)
            .then(() => {
                createAlert("success", "Correo para reiniciar contraseña enviado.")
                history.push("/")
            })
            .catch(error => {
                setError("resetPassword", {
                    type: "firebase-error",
                    message: error.message
                })
                console.error(error)
            })
    }

    const onError = (errors) => {
        console.error(errors)
    }

    const handleOnCancelClick = () => {
        history.push("/login")
    }

    useEffect(() => {
        if (email) {
            setValue("email", email)
        }
    }, [email, setValue])

    return (
        <Box display="flex">
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOpenOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Reiniciar Contraseña
                    </Typography>
                    <br />
                    {
                        (errors && errors.resetPassword) &&
                        <Alert severity="error">
                            {errors.resetPassword.message}
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
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    className={classes.submit}>
                                    Reiniciar
                                </Button>
                            </Grid>
                            <Grid item sm={6}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    onClick={(e) => handleOnCancelClick(e)}
                                    className={classes.submit}>
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Container>
        </Box>
    )
}

export default ResetPassword
