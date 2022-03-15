import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { useHistory , useParams } from 'react-router'
import * as yup from "yup"
import SelectFieldInput from '../../../../components/inputs/SelectFieldInput'
import TextFieldInput from '../../../../components/inputs/TextFieldInput'
import BankCardFieldInput from '../../../../components/inputs/BankCardFieldInput'
import Loading from '../../../../components/Loading'
import { useAlerts } from '../../../../contexts/AlertsContext'
import { db } from '../../../../firebase'
import BankDialog from './components/BankDialog'

const schema = yup.object().shape({
    order: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Orden requerido")
        .default(1),
    bankId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Banco requerido"),
    account: yup.string().required("Cuenta requerida").default(""),
    clabe: yup.string().required("CLABE requerida").default(""),
    debitCard: yup.string().required("No. de Tarjeta requerido").default("")
})

const BankAccountEditPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { id: bankAccountId } = useParams()
    const { promiseInProgress } = usePromiseTracker()

    const [optionsBA, setOptionsBA] = useState([])
    const [openDialogBA, setOpenDialogBA] = useState(false)
    const [valueToAddBA, setValueToAddBA] = useState("")

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const handleCancelClick = () => {
        history.push("/catalog/bank-account")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("bankAccount")
                .doc(bankAccountId)
                .update(data)
                .then(() => {
                    console.info("bankAccount updated.")
                    createAlert("success", "Cuenta de Banco actualizada.")
                    history.push("/catalog/bank-account")
                })
                .catch((error) => {
                    console.error("Error updating bankAccount: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar la cuenta de banco."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection('bankAccount')
                .doc(bankAccountId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let bankAccount = doc.data();

                        for (const property in bankAccount) {
                            let value = {}

                            if(property === "bankId")
                            {
                                value = optionsBA ? optionsBA.find(o => o.value === bankAccount[property]) : {}
                                setValue(property, value);
                            }
                            else
                            {
                                setValue(property, bankAccount[property]);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original bankAccount: ", error)
                    createAlert("error", "No se encontro la cuenta de banco.")
                    history.push("/catalog/bank-account")

                }))
    }, [bankAccountId, setValue, optionsBA, createAlert, history])


    useEffect(() => {
        const unsubscribe =
            db.collection("bank")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let banks = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        banks.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setOptionsBA(banks);
                }, (error) => {
                    console.error("Unable to subscribe to bank, error: ", error)
                })
        return unsubscribe
    }, [])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%">
            <Box width="70%">
                <form>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="200px">
                        {
                            (errors && errors.save) &&
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                        }
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        name="order"
                                        control={control}
                                        type="number"
                                        label="Orden"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item sm={6}>
                                    <SelectFieldInput
                                        name="bankId"
                                        label="Banco"
                                        freeSolo
                                        canAdd
                                        setOpenDialog={setOpenDialogBA}
                                        setValueToAdd={setValueToAddBA}
                                        control={control}
                                        setValue={setValue}
                                        variant="outlined"
                                        fullWidth
                                        options={optionsBA} />
                                </Grid>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        name="account"
                                        label="Cuenta"
                                        control={control}
                                        fullWidth />
                                </Grid>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        name="clabe"
                                        label="CLABE"
                                        control={control}
                                        fullWidth />
                                </Grid>
                                <Grid item sm={6}>
                                    <BankCardFieldInput
                                        name="debitCard"
                                        label="No. Tarjeta Debito"
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box
                            display="flex"
                            justifyContent="flex-end">
                            <Box display="flex" justifyContent="space-between" width="230px">
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit(onSubmit, onError)}
                                    disabled={isSubmitting}>
                                    Guardar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleCancelClick}
                                    disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </form>
                <BankDialog
                    open={openDialogBA}
                    setOpen={setOpenDialogBA}
                    valueToAdd={valueToAddBA} />
            </Box>
        </Box>
    )
}

export default BankAccountEditPage
