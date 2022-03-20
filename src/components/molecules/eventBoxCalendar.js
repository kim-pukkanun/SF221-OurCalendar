import React from 'react';
import {Box} from 'native-base';

class EventBoxCalendar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Box borderWidth={1} zIndex={1} bottom="67.5%" h="15%" {...this.props.event_attr} _text={{ fontSize:"2xs", lineHeight:"xs"}}>{this.props.text}</Box>
        );
    }
}

export default EventBoxCalendar;