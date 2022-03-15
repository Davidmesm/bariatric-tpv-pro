import { Box, Button, Typography } from "@material-ui/core"
import { AddCircle, Delete, Edit } from "@material-ui/icons"
import React from "react"
import { useHistory, useRouteMatch } from "react-router"
import WarehouseSelectInput from "./WarehouseSelectInput"

const InventoryToolBar = (props) => {

    const history = useHistory()
    let { path } = useRouteMatch()

    const {
        warehouseValue, 
        setWarehouseValue, 
        warehouseOptions,
        setOpenDeleteDialog
    } = props

    const handleAddWarehouse = () => history.push(`${path}/warehouse/add`);
    const handleEditWarehouse = () => history.push(`${path}/warehouse/edit/${warehouseValue.value}`);
    const handleDeleteWarehouse = () => setOpenDeleteDialog(true)

    return (
        <Box 
            marginTop="20px" 
            marginBottom="20px" 
            borderBottom={1}
            paddingBottom={4}
            borderColor="primary.main">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5">
                        Inventario
                    </Typography>
                </Box>
                <Box width="300px">
                    <WarehouseSelectInput 
                        options={warehouseOptions}
                        value={warehouseValue}
                        setValue={setWarehouseValue}/>
                </Box>
                <Box
                    height="50px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="400px">
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleAddWarehouse()}
                        startIcon={<AddCircle />}>
                        Agregar
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleEditWarehouse()}
                        disabled={!warehouseValue}
                        startIcon={<Edit />}>
                        Editar
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteWarehouse()}
                        disabled={!warehouseValue}
                        startIcon={<Delete />}>
                        Eliminar
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default InventoryToolBar
