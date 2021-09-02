import moment from 'moment';
import 'moment/locale/vi';
import 'moment/locale/es-us';

export const timeAgo = (date, locale = 'vi') => {
    const str = moment(date).locale(locale).fromNow() // 20 years ago
    return str ? str : date;
}

export const isToday = (date) => {
    return moment(date).isSame(moment(), 'day');
}