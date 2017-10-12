import moment from 'moment';

export const validations = {
    checkMinLength: function(text, minLength) {
        if(text.length >= minLength) {
            return '';
        } else {
            return `length should be at least ${minLength} characters`;
        }
    },

    timeShouldBeInTheFuture: function (t) {
        if(moment(t).isValid() && moment(t).isSameOrAfter(moment())) {
            return '';
        } else {
            return 'can\'t be in the past';
        }
    }
}
