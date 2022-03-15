import { Box, Grid, Typography } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import BooleanFieldInput from "../../../components/inputs/BooleanFieldInput"
import CurrencyFieldInput from "../../../components/inputs/CurrencyFieldInput"
import SelectFieldInput from "../../../components/inputs/SelectFieldInput"

const PaymentInfoForm = (props) => {
    const { control, watch, setValue } = useFormContext()

    const { bankAccountData, paymentTypeData, clientCommissionData } = props

    const [clientCommission, setClientCommission] = useState(0)

    const watchHasCommissionApplied = watch("hasCommissionApplied")
    const watchCommissionApplied = watch("commissionApplied", 0)
    const watchTotalProducts = watch("totalProducts", 0)
    const watchTotal = watch("total", 0)
    const watchHasChargeDelivery = watch("hasChargeDelivery", false)
    const watchDeliveryCost = watch("deliveryCost", 0)
    const watchPaymentTypeId = watch("paymentTypeId")

    useEffect(() => {
        let totalCommisions = clientCommissionData.reduce((accum, curr) => {
            return accum + curr.commission
        }, 0)

        setClientCommission(totalCommisions)
    }, [clientCommissionData])

    useEffect(() => {
        let total = watchTotalProducts + (watchHasChargeDelivery ? parseFloat(watchDeliveryCost) : 0) - watchCommissionApplied

        setValue("total", total)
    }, [watchCommissionApplied, watchHasChargeDelivery, watchDeliveryCost, watchTotalProducts, setValue])

    return (
        <Box
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                padding={3}
                minHeight="380px">
                <Grid container spacing={3}>
                    <Grid item sm={6}>
                        <BooleanFieldInput
                            name="requiresInvoice"
                            control={control}
                            label="Requiere Factura" />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item sm={6}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            height="150px">
                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Comisión Disponible:
                                </Typography>
                                <Typography>
                                    $ {parseFloat(clientCommission).toFixed(2)}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Box flexGrow={1}>
                                    <BooleanFieldInput
                                        name="hasCommissionApplied"
                                        disabled={clientCommission === 0}
                                        control={control}
                                        label="Aplicar Comisión" />
                                </Box>
                                <Box flexGrow={1}>
                                    <CurrencyFieldInput
                                        name="commissionApplied"
                                        fullWidth
                                        control={control}
                                        disabled={!watchHasCommissionApplied}
                                        label="Comisión Aplicada" />
                                </Box>
                            </Box>
                            <Box>
                                <SelectFieldInput
                                    name="paymentTypeId"
                                    label="Forma de Pago"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={paymentTypeData} />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item sm={6}>
                        <Box borderColor="secondary.main"
                            border={2}
                            borderRadius={3}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                height="150px"
                                padding={2}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <Typography>
                                        Total Productos:
                                    </Typography>
                                    <Typography>
                                        $ {parseFloat(watchTotalProducts).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <Typography>
                                        Costo Envio:
                                    </Typography>
                                    <Typography>
                                        $ {watchHasChargeDelivery ? parseFloat(watchDeliveryCost).toFixed(2) : (0).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <Typography>
                                        Comisión Aplicada:
                                    </Typography>
                                    <Typography>
                                        - $ {watchCommissionApplied ? parseFloat(watchCommissionApplied).toFixed(2) : 0}
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <Typography>
                                        Total Pago:
                                    </Typography>
                                    <Typography >
                                        $ {parseFloat(watchTotal).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                    <Grid container spacing={3}>
                        <Grid item sm={6}>
                        <SelectFieldInput
                                    name="bankAccountId"
                                    label="Cuenta"
                                    control={control}
                                    setValue={setValue}
                                    disabled={!watchPaymentTypeId || !watchPaymentTypeId.requiredBankAccount}
                                    variant="outlined"
                                    fullWidth
                                    options={bankAccountData} />
                        </Grid>
                    </Grid>
            </Box>
        </Box>
    )
}

export default PaymentInfoForm
