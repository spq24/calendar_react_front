import React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';
import { validations } from '../utils/validations';
import { FormErrors } from './FormErrors';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import $ from 'jquery';
import './react-datetime.css';

export default class AppointmentForm extends React.Component {
  static PropTypes = {
    handleNewAppointment: PropTypes.func
  }

  constructor(props, railsContext) {
    super(props)

    this.state = {
      name: {value: '', valid: false},
      time: {value: new Date(), valid: false},
      formErrors: {},
      formValid: false,
      editing: false
    }
  }

  static formValidations = {
    name: [
      (s) => { return(validations.checkMinLength(s, 3)) }
    ],
    time: [
      (t) => { return(validations.timeShouldBeInTheFuture(t))}
    ]
  }

  componentDidMount () {
    if(this.props.match) {
      $.ajax({
          type: "GET",
          url: `http://localhost:3001/appointments/${this.props.match.params.id}`,
          dataType: "JSON",
          headers: JSON.parse(sessionStorage.user)
      }).done((data) => {
          this.setState({
                          name: {value: data.name, valid: true},
                          time: {value: data.time, valid: true},
                          editing: this.props.match.path === '/appointments/:id/edit'
          });
      })
    }
  }

  handleUserInput = (fieldName, fieldValue, validations) => {
    const newFieldState = update(this.state[fieldName],
                                  {value: {$set: fieldValue}});
    this.setState({[fieldName]: newFieldState},
                  () => { this.validateField(fieldName, fieldValue, validations) });
  }

  validateField (fieldName, fieldValue, validations) {
    let fieldValid;

    let fieldErrors = validations.reduce((errors, v) => {
      let e = v(fieldValue);
      if(e !== '') {
        errors.push(e);
      }
      return(errors);
    }, []);

    fieldValid = fieldErrors.length === 0;

    const newFieldState = update(this.state[fieldName],
                                  {valid: {$set: fieldValid}});

    const newFormErrors = update(this.state.formErrors,
                                  {$merge: {[fieldName]: fieldErrors}});

    this.setState({[fieldName]: newFieldState,
                    formErrors: newFormErrors}, this.validateForm);
  }

  validateForm () {
    this.setState({formValid: this.state.name.valid &&
                              this.state.time.valid
                  });
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.state.editing ?
      this.updateAppointment() :
      this.addAppointment();
  }

  addAppointment () {
    const appointment = {name: this.state.name.value, time: this.state.time.value};
    $.ajax({
            type: 'POST',
            url: 'http://localhost:3001/appointments',
            data: {appointment: appointment},
            headers: JSON.parse(sessionStorage.user)
          })
          .done((data) => {
            this.props.handleNewAppointment(data);
            this.resetFormErrors();
            this.resetForm();
          })
          .fail((response) => {
            this.setState({formErrors: response.responseJSON,
                            formValid: false})
          });
  }

  deleteAppointment = () => {
    $.ajax({
          type: "DELETE",
          url: `http://localhost:3001/appointments/${this.props.match.params.id}`,
          headers: JSON.parse(sessionStorage.user)
        })
        .done((data) => {
          this.props.history.push('/');
          this.resetFormErrors();
        })
        .fail((response) => {
          console.log('appointment delete failed');
        });
  }

  updateAppointment () {
    const appointment = {name: this.state.name.value, time: this.state.time.value};
    $.ajax({
          type: "PATCH",
          url: `http://localhost:3001/appointments/${this.props.match.params.id}`,
          data: {appointment: appointment},
          headers: JSON.parse(sessionStorage.user)
        })
        .done((data) => {
          console.log('appointment updated');
          this.resetFormErrors();
          this.props.history.push('/');
        })
        .fail((response) => {
          this.setState({formErrors: response.responseJSON})
        });
  }

  resetFormErrors () {
    this.setState({formErrors: {}})
  }

  resetForm () {
    this.setState({
      name: {value: '', valid: false},
      time: {value: '', valid: false},
      formErrors: {},
      formValid: false
    })
  }

  handleChange = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    this.handleUserInput(fieldName, fieldValue,
                              AppointmentForm.formValidations[fieldName]);
  }

  setApptTime = (e) => {
    const fieldName = 'time';
    const fieldValue =  e.toDate();
    this.handleUserInput(fieldName, fieldValue,
                              AppointmentForm.formValidations[fieldName]);
  }

  render () {
    const inputProps = {
        time: 'time'
    };

    return (
      <div>
      <h2>
        {this.state.editing ?
          'Edit appointment' :
          'Make a new appointment'}
      </h2>

        <FormErrors formErrors={ this.state.formErrors} />
        <form onSubmit={this.handleFormSubmit} >
          <input name='name' placeholder='Appointment Title'
            value={this.state.name.value}
            onChange={this.handleChange} />
          <Datetime input={false} open={true} inputProps={inputProps} value={moment(this.state.time.value)} onChange={this.setApptTime}/>
          <input type='submit' value={this.state.editing ? 'Save Updates' : 'Make Appointment'} className="submit-button" disabled={!this.state.formValid} />
        </form>
        {this.state.editing && (
          <p>
            <button onClick={this.deleteAppointment}>
              Delete
            </button>
          </p>
        )}
      </div>
    )
  }
}
