import { Box, Grid, IconButton, Typography } from '@material-ui/core'
import { RemoveCircleOutline } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import SelectFieldInput from '../../../components/inputs/SelectFieldInput'
import TextFieldInput from '../../../components/inputs/TextFieldInput'



const ProductModel = (props) => {

    const { field, index, productData, warehouseInventoryData, priceTypeData, handleRemove} = props

    const { control, watch, setValue, getValues } = useFormContext()

    const watchProductId = watch(`products[${index}].productId`)
    const watchFlavour = watch(`products[${index}].flavour`)
    const watchPrice = watch(`products[${index}].price`)
    const watchQty = watch(`products[${index}].qty`)
    const watchTotal = watch(`products[${index}].total`)
    const watchBuyerId = watch(`buyerId`)

    const [flavourOptions, setFlavourOptions] = useState([])
    const [priceOptions, setPriceOptions] = useState([])

    const formatPriceLabel = (label) => {
        return `$${(parseFloat(label) || 0.00).toFixed(2)}`
    }

    useEffect(() => {
        let flavourOptions = []
        let priceOptions = []

        if (watchProductId && watchProductId.flavours) {
            flavourOptions = watchProductId.flavours.map(f => {
                return { value: f.name, render: f.name, label: f.name }
            })
        }
        else {
            setValue(`products.${index}.flavour`, "")
        }

        setFlavourOptions(flavourOptions)

        if (watchProductId && watchProductId.prices) {
            priceOptions = watchProductId.prices.map(p => {
                let priceType = priceTypeData.find(pt => pt.id === p.priceTypeId)

                let priceTypeName = priceType ? priceType.name : ""

                return { value: p.price.toString(), render: `${priceTypeName} : $${(p.price || 0.00).toFixed(2)}`, label: `${p.price}`, priceTypeId: p.priceTypeId }
            })
        }

        setPriceOptions(priceOptions)

    }, [watchProductId, index, priceTypeData, setValue])

    useEffect(() => {
        if (watchBuyerId && watchBuyerId.priceTypeId) {
            let clientPriceType = priceOptions.find(po => po.priceTypeId === watchBuyerId.priceTypeId)

            if (clientPriceType) {
                setValue(`products.${index}.defaultPrice`, clientPriceType.value)
            }
            else {
                setValue(`products.${index}.defaultPrice`, 0)
            }
        }
    }, [watchProductId, priceOptions, watchBuyerId, index, setValue])

    useEffect(() => {
        let availableQty = 0;

        if (watchProductId && watchProductId.value) {
            let products = []

            warehouseInventoryData.forEach(inv => {
                inv.products.forEach(product => {
                    let flavour = watchFlavour && watchFlavour.value ? watchFlavour.value : undefined

                    if (product.productId === watchProductId.value
                        && (product.flavour ?? "") === (flavour ?? "")) {
                        products = [...products, product];
                    }
                })
            })

            availableQty = products.reduce((accum, curr) => {
                return accum + curr.qty;
            }, 0)
        }

        setValue(`products.${index}.available`, availableQty)
    }, [watchProductId, watchFlavour, index, setValue, warehouseInventoryData])

    useEffect(() => {
        let total = 0

        if (watchPrice && watchQty) {
            if (watchPrice.value) {
                if (watchQty > 0) {
                    total = watchPrice.value * watchQty
                }
            }
            else {
                if (watchQty > 0) {
                    total = parseFloat(watchPrice) * watchQty
                }
            }
        }

        setValue(`products.${index}.total`, total)

    }, [watchPrice, watchQty, index, setValue])

    useEffect(() => {
        let total = 0

        let products = getValues("products")

        total = products.reduce((accum, curr) => {
            return accum + curr.total
        }, 0)

        setValue("totalProducts", total)

    }, [watchTotal, getValues, setValue])

    return (
        <Box marginTop={1} marginBottom={4}>
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
                        options={productData} />
                    <Box paddingLeft={2}>
                        <Typography variant="caption">
                            {`Disponible: ${field.available}`}
                        </Typography>
                    </Box>
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
                        options={flavourOptions} />
                </Grid>
                <Grid item sm={3}>
                    <SelectFieldInput
                        name={`products.${index}.price`}
                        label="Precio"
                        freeSolo
                        canAdd
                        control={control}
                        setValue={setValue}
                        variant="outlined"
                        valueFromParent={field.price}
                        formatLabel={formatPriceLabel}
                        defaultValue={field.price}
                        fullWidth
                        options={priceOptions} />
                    <Box paddingLeft={2}>
                        <Typography variant="caption">
                            {`Precio Sugerido: $${(parseFloat(field.defaultPrice) || 0.00).toFixed(2)}`}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item sm={3}>
                    <Box
                        display="flex"
                        justifyContent="space-between">

                        <Box>
                            <TextFieldInput
                                name={`products.${index}.qty`}
                                control={control}
                                type="number"
                                label="Cantidad"
                                fullWidth
                            />
                            <Box paddingLeft={2}>
                                <Typography variant="caption">
                                    {`Total: $${(field.total || 0.00).toFixed(2)}`}
                                </Typography>
                            </Box>
                        </Box>
                        <Box alignSelf="baseline">
                            <IconButton
                                color="secondary"
                                aria-label="remove"
                                component="span"
                                onClick={() => handleRemove(index)}>
                                <RemoveCircleOutline />
                            </IconButton>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProductModel
