import { TextField } from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab'
import React from 'react'

const WarehouseSelectInput = (props) => {

    const filter = createFilterOptions();

    const { options,
        value,
        setValue,
        onChange
    } = props

    const handleOnChange = (e, newValue) => {
        let value = ""

        if (newValue) {
            if (typeof newValue === "string") {
                value = newValue;
            }
            else if (newValue && newValue.inputValue) {
                value = newValue;
            }
            else {
                value = newValue
            }
        }

        onChange && onChange(e, value)
        setValue(value)
    }


    return (
        <Autocomplete
            id="warehouse"
            options={options}
            value={value}
            getOptionLabel={(option) => {
                if (typeof option === 'string') {
                    return option;
                }
                if (option.inputValue) {
                    return option.inputValue;
                }

                return option.label;
            }}
            renderOption={(option) => (
                <React.Fragment>
                    {typeof option === 'string' ? option : option.render}
                </React.Fragment>
            )}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                return filtered;
            }}
            onChange={(e, newValue) => handleOnChange(e, newValue)}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderInput={(params) =>
                <TextField
                    {...params}
                    label="Almacen"
                    variant="outlined"
                    fullWidth />}
        />
    )
}

export default WarehouseSelectInput
