import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function relativeDate(timestamp: Date) {
    const date = dayjs(timestamp);
    const now = dayjs();

    if (now.diff(date, 'day') >= 1) {
        return date.format('DD.MM.YYYY');
    }

    return date.fromNow();
}
