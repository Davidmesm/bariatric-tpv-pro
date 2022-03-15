import { IconButton, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core"
import { ArrowForwardIos } from "@material-ui/icons"
import React from "react"
import { Link } from "react-router-dom"

const CustomLink = (React.forwardRef((props, ref) => (
    <Link {...props} ref={ref} />
)))

const CommissionMenuItem = (props) => {
    const { title, link, entity } = props

    return (
        <ListItem>
            <ListItemText primary={title} />
            <ListItemSecondaryAction>
                <IconButton
                    edge="end"
                    aria-label={entity}
                    component={CustomLink}
                    color="secondary"
                    to={link}>
                    <ArrowForwardIos />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default CommissionMenuItem
