export function toDateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function isSameDay(a: string, b: string) {
    return a.slice(0, 10) === b.slice(0, 10);
}

export function startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

export function startOfWeek(date: Date) {
    const copy = startOfDay(date);
    const day = copy.getDay();
    const diff = (day + 6) % 7;
    copy.setDate(copy.getDate() - diff);
    return copy;
}

export function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('cs-CZ', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function formatShortDate(value: string) {
    return new Intl.DateTimeFormat('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
    }).format(new Date(value));
}

export function formatMonthTitle(date: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function getMonthGrid(date: Date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const firstGridDay = startOfWeek(monthStart);
    const days = [] as Date[];

    const cursor = new Date(firstGridDay);
    while (cursor <= monthEnd || cursor.getDay() !== 1) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
        if (days.length > 42) {
            break;
        }
    }

    return days;
}

export function isCurrentMonthDay(day: Date, month: Date) {
    return day.getMonth() === month.getMonth();
}

export function toIsoDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}