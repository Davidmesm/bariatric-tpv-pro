import { Box, Button, Grid, IconButton, Typography } from '@material-ui/core'
import { RemoveCircleOutline } from '@material-ui/icons'
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import CurrencyFieldInput from '../../../components/inputs/CurrencyFieldInput'
import SelectFieldInput from '../../../components/inputs/SelectFieldInput'
import TextFieldInput from '../../../components/inputs/TextFieldInput'

const InventoryProductForm = (props) => {

    const { schema, productOptions } = props

    const { control, watch, setValue } = useFormContext()

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
        default: schema.cast()
    })

    const hasFlavours = (field) => {
        if (field && field.productId) {
            if(field.productId.flavours)
                return false
        }
        return true;
    }

    const getFlavours = (field) => {
        let result = []

        if (field && field.productId) {
            if(field.productId.flavours)
                result = field.productId.flavours.map(flavour => (
                    {value: flavour.name, label: flavour.name, render: flavour.name}
                ))
        }

        return result;
    }

    const watchProducts = watch("products");
    const controlledProducts = fields.map((field, index) => {
        return {
            ...field,
            ...watchProducts[index]
        }
    })

    return (
        <Box
            marginTop={10}
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                padding={2}>
                <Box
                    marginTop={2}
                    marginBottom={2}
                    display="flex"
                    justifyContent="space-between"
                    width="100%">
                    <Typography variant="h6">
                        Productos
                    </Typography>
                    <Box display="flex" justifyContent="space-between">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => append(schema.cast())}>
                            Agregar
                        </Button>
                    </Box>
                </Box>
                {controlledProducts.map((field, index) => (
                    <Box marginTop={1} marginBottom={4} key={field.id}>
                        <Grid container spacing={3}>
                            <Grid item sm={3}>
                                <SelectFieldInput
                                    name={`products.${index}.productId`}
                                    label="Producto"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    valueFromParent={field.productId}
                                    defaultValue={field.productId}
                                    fullWidth
                                    options={productOptions} />
                            </Grid>
                            <Grid item sm={3}>
                                <SelectFieldInput
                                    name={`products.${index}.flavour`}
                                    label="Versión"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    valueFromParent={field.flavour}
                                    defaultValue={field.flavour}
                                    fullWidth
                                    disabled={hasFlavours(field)}
                                    options={getFlavours(field)} />
                            </Grid>
                            <Grid item sm={3}>
                                <CurrencyFieldInput
                                    name={`products.${index}.cost`}
                                    label="Costo"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={3}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <TextFieldInput
                                        name={`products.${index}.qty`}
                                        label="Cantidad"
                                        type="number"
                                        defaultValue={field.qty}
                                        fullWidth />
                                    <Box alignSelf="baseline">
                                        <IconButton
                                            color="secondary"
                                            aria-label="remove"
                                            component="span"
                                            onClick={() => remove(index)}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Box>

    )
}

export default InventoryProductForm
