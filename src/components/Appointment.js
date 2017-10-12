import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';
import PropTypes from 'prop-types'
import $ from 'jquery';

export default class Appointment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            appointment: props.appointment
        }
    }

    static propTypes = {
        appointment: PropTypes.object.isRequired
    }

    static defaultProps = {
        appointment: {}
    }

    componentDidMount () {
        if(this.props.match) {
            $.ajax({
                type: "GET",
                url: `http://localhost:3001/appointments/${this.props.match.params.id}`,
                dataType: "JSON",
                headers: JSON.parse(sessionStorage.user)
            }).done((data) => {
                this.setState({appointment: data});
            })
        }
    }

    render () {
        return (
            <div className='appointment'>
                <Link to={`/appointments/${this.state.appointment.id}`} >
                    <h3>{this.state.appointment.name}</h3>
                </Link>
                <p>{formatDate(this.state.appointment.time)}</p>
                <Link to={`/appointments/${this.state.appointment.id}/edit`} >
                    <h4>edit</h4>
                </Link>
            </div>
        )
    }
}
