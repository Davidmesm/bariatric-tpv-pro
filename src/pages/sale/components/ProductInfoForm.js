import { Box, Button, Chip, Typography } from '@material-ui/core'
import React  from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import ProductModel from './ProductModel'

const ProductInfoForm = (props) => {

    const { schema, productData, warehouseInventoryData, priceTypeData } = props

    const { control } = useFormContext()

    const watchProducts = useWatch({name: "products"})
    const watchTotalProducts = useWatch({name: "totalProducts"})

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
        default: watchProducts || []
    })

    const controlledProducts = fields.map((field, index) => {
        return {
            ...field,
            ...watchProducts[index]
        };
    });

    const handleRemove = (index) => {
        remove(index)
    }

    return (
        <Box
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                padding={2}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%">
                    <Typography variant="h6">
                        Productos
                    </Typography>
                    <br />
                    <Box display="flex" width="240px" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => append(schema.cast())}>
                            Agregar
                        </Button>
                    </Box>
                </Box>
                <br />
                {
                    controlledProducts.map((field, index) => (
                            <Box key={field.id}>
                            <ProductModel
                                field={field}
                                index={index}
                                productData={productData}
                                priceTypeData={priceTypeData}
                                warehouseInventoryData={warehouseInventoryData}
                                handleRemove={handleRemove} />
                            </Box>
                    ))
                }
                <Box display="flex" justifyContent="flex-end">
                    <Chip color="primary" label={`Total: $${(parseFloat(watchTotalProducts) || 0.00).toFixed(2)}`} />
                </Box>
            </Box>
        </Box>
    )
}

export default ProductInfoForm
