import { TextField } from "@material-ui/core"
import { Autocomplete, createFilterOptions } from "@material-ui/lab"
import React from "react"
import { useController } from "react-hook-form"

const filter = createFilterOptions();

const SelectFieldInput = (props) => {

    const {
        control,
        setValue,
        name,
        label,
        options,
        freeSolo,
        canAdd,
        variant,
        fullWidth,
        onChange,
        setOpenDialog,
        disabled,
        defaultValue,
        valueFromParent,
        formatLabel,
        onChangeArgs,
        setValueToAdd } = props

    const { field, fieldState } = useController({ name, control, default: defaultValue || ""})

    const handleOnChange = (e, newValue) => {
        let value = ""

        if (newValue) {
            if (typeof newValue === "string") {
                if (canAdd) {
                    setTimeout(() => {
                        setValueToAdd && setValueToAdd(newValue)
                        setOpenDialog && setOpenDialog(true)
                    })
                }
                value = newValue;
            }
            else if (newValue && newValue.inputValue) {
                if (canAdd) {
                    setTimeout(() => {
                        setValueToAdd && setValueToAdd(newValue)
                        setOpenDialog && setOpenDialog(true)
                    })
                }
                value = newValue.inputValue;
            }
            else {
                value = newValue
            }
        }

        onChange && onChange(e, value, onChangeArgs)
        setValue(name, value)
    }

    return (
        <Autocomplete
            id={name}
            options={options}
            freeSolo={freeSolo}
            value={valueFromParent || field.value}
            getOptionSelected={(option, value) => {
                if(typeof value === 'string')
                {
                    return option.label === value
                }
                else
                {
                    if(value.value)
                    {
                        return option.value === value.value
                    }
                }

                return false
            }}
            getOptionLabel={(option) => {
                let currLabel = ""

                if (typeof option === 'string') {
                    currLabel = formatLabel ? formatLabel(option) : option
                    return currLabel;
                }
                if (option.inputValue) {
                    
                    currLabel = formatLabel ? formatLabel(option.inputValue) : option.inputValue
                    return currLabel;
                }

                currLabel = formatLabel ? formatLabel(option.label) : option.label

                return currLabel;
            }}
            renderOption={(option) => (
                <React.Fragment>
                    {typeof option === 'string' ? option : option.render}
                </React.Fragment>
            )}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue !== '' && canAdd) {
                    filtered.push({
                        inputValue: params.inputValue,
                        render: `Agregar "${params.inputValue}"`,
                    });
                }

                return filtered;
            }}
            onChange={(e, newValue) => handleOnChange(e, newValue)}
            onBlur={(e) => field.onBlur(e)}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            disabled={disabled}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label={label}
                    variant={variant}
                    ref={field.ref}
                    fullWidth={fullWidth}
                    disabled={disabled}
                    helperText={fieldState.error ? fieldState.error.message : ""}
                    error={fieldState.error ? true : false} />}
        />
    )
}

export default SelectFieldInput
