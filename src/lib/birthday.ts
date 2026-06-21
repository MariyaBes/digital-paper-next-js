// Утилиты для виджета «Дни рождения сотрудников».
// Работают с полем birthday (формат YYYY-MM-DD, может быть null).
// Год намеренно игнорируем — показываем только день и месяц (приватность).

const MONTHS_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export interface MonthDay {
    month: number; // 1–12
    day: number; // 1–31
}

/** Разбирает строку birthday в день/месяц. Принимает 'YYYY-MM-DD' или ISO-дату. */
export function parseBirthday(value: string | null | undefined): MonthDay | null {
    if (!value) {
        return null;
    }

    const parts = value.slice(0, 10).split('-');
    if (parts.length < 3) {
        return null;
    }

    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    return { month, day };
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Сколько дней до ближайшего дня рождения (0 — сегодня). */
export function daysUntilBirthday(month: number, day: number, from: Date = new Date()): number {
    const today = startOfDay(from);
    let next = new Date(today.getFullYear(), month - 1, day);
    if (next.getTime() < today.getTime()) {
        next = new Date(today.getFullYear() + 1, month - 1, day);
    }
    return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

/** «23 июня» */
export function formatBirthday(month: number, day: number): string {
    return `${day} ${MONTHS_GENITIVE[month - 1]}`;
}

/** «сегодня» / «завтра» / «через 3 дня» с правильным склонением. */
export function humanizeDays(days: number): string {
    if (days === 0) return 'сегодня';
    if (days === 1) return 'завтра';

    const mod100 = days % 100;
    const mod10 = days % 10;
    let word = 'дней';
    if (mod100 < 11 || mod100 > 14) {
        if (mod10 === 1) word = 'день';
        else if (mod10 >= 2 && mod10 <= 4) word = 'дня';
    }
    return `через ${days} ${word}`;
}

/** Инициалы из фамилии и имени для аватара-заглушки. */
export function getInitials(firstName?: string, lastName?: string): string {
    const first = (lastName?.trim()?.[0] ?? '').toUpperCase();
    const second = (firstName?.trim()?.[0] ?? '').toUpperCase();
    return first + second || '?';
}
