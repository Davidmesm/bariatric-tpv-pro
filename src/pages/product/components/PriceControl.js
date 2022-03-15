import { Box, Grid, Typography } from "@material-ui/core"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import CurrencyFieldInput from "../../../components/inputs/CurrencyFieldInput"
import SelectFieldInput from "../../../components/inputs/SelectFieldInput"

const PriceControl = (props) => {
    const { options } = props

    const { control, watch, setValue } = useFormContext()

    const { fields } = useFieldArray({
        control,
        name: "prices"
    })

    const watchPrices = watch("prices")
    const controlledPrices = fields.map((field, index) => {
        return {
            ...field,
            ...watchPrices[index]
        };
    });

    return (
        <Box
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                padding={2}>
                <Typography variant="h6">
                    Precios
                </Typography>
                <br />
                {controlledPrices.map((field, index) => (
                    <Box marginTop={1} marginBottom={4} key={field.id}>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name={`prices.${index}.priceTypeId`}
                                    label="Tipo de Precio"
                                    setValue={setValue}
                                    variant="outlined"
                                    control={control}
                                    options={options}
                                    disabled
                                    valueFromParent={field.priceTypeId}
                                    defaultValue={field.priceTypeId}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <CurrencyFieldInput
                                    name={`prices.${index}.price`}
                                    label="Precio"
                                    fullWidth
                                    control={control} />
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Box>

    )
}

export default PriceControl
