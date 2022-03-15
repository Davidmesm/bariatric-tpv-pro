import { Box, Button, Typography } from "@material-ui/core"
import { AddCircle } from "@material-ui/icons"
import ExportButton from "../../components/buttons/ExportButton"
import React from "react"

const PageToolBar = (props) => {
    const {title, disableAddButton, data, headers, addFunction} = props

    const handleActionChange = (e) => {
        addFunction(e)
    }

    return (
        <Box marginTop="20px" marginBottom="20px">
            <Box display="flex" 
                 justifyContent="space-between" 
                 alignItems="center">
                <Box>
                    <Typography variant="h5">
                        {title}
                    </Typography>
                </Box>
                <Box 
                    height="50px" 
                    display="flex" 
                    justifyContent="space-around" 
                    width="300px"
                    alignItems="center">
                        {
                        <Button
                            variant="outlined"
                            color="secondary"
                            disabled={disableAddButton}
                            onClick={(e) => handleActionChange(e)} 
                            startIcon={<AddCircle />}>
                                Agregar
                        </Button>}
                        {<ExportButton data={data || []} 
                                       headers = {headers}
                                       disabled = {!data || data.length === 0}/>}
                </Box>
            </Box> 
        </Box>
    )
}

export default PageToolBar
