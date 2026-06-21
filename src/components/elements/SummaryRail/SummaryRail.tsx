import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spin } from 'antd';

import { useOrganization } from '../../../context/OrganizationContext';
import { listOrganizationUsers } from '../../../api/organizationUsers';
import { UserListItem } from '../../../api/dto/user.dto';
import { API_BASE_URL } from '../../../config/api.config';
import { notifyError } from '../../../lib/notify';
import {
    daysUntilBirthday,
    formatBirthday,
    getInitials,
    humanizeDays,
    parseBirthday,
} from '../../../lib/birthday';

// Тянем достаточно сотрудников, чтобы корректно найти ближайшие ДР.
const FETCH_SIZE = 200;
// Показываем только дни рождения в пределах ближайшего месяца.
const WINDOW_DAYS = 31;

interface UpcomingBirthday {
    user: UserListItem;
    month: number;
    day: number;
    days: number;
}

/** Аватар именинника: грузим по публичному эндпоинту, при ошибке — инициалы. */
function BirthdayAvatar({ userId, initials }: { userId: string; initials: string }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <span className="srl-avatar" aria-hidden="true">
                {initials}
            </span>
        );
    }

    return (
        <img
            className="srl-avatar srl-avatar--img"
            src={`${API_BASE_URL}/api/v1/users/${userId}/avatar`}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}

/**
 * Правый информационный rail «Сводка». Содержит карточку ближайших дней
 * рождения сотрудников организации (в пределах месяца). Размещается на
 * странице «Сотрудники» (см. .page-rail).
 */
export default function SummaryRail() {
    const { selectedOrganization } = useOrganization();
    const orgId = selectedOrganization?.id;

    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        if (!orgId) {
            return;
        }

        setLoading(true);

        try {
            const response = await listOrganizationUsers(orgId, { size: FETCH_SIZE });
            setUsers(response.list);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить дни рождения');
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const upcoming = useMemo<UpcomingBirthday[]>(() => {
        return users
            .map((user) => {
                const monthDay = parseBirthday(user.birthday);
                if (!monthDay) {
                    return null;
                }
                return {
                    user,
                    month: monthDay.month,
                    day: monthDay.day,
                    days: daysUntilBirthday(monthDay.month, monthDay.day),
                };
            })
            .filter((item): item is UpcomingBirthday => item !== null)
            // Только ближайший месяц.
            .filter((item) => item.days <= WINDOW_DAYS)
            .sort((a, b) => a.days - b.days);
    }, [users]);

    return (
        <aside className="srl" aria-label="Сводка">
            <section className="pf-card srl-card">
                <header className="pf-card__head">
                    <span className="pf-card__icon pf-card__icon--emoji" aria-hidden="true">
                        🎂
                    </span>
                    <div>
                        <h3 className="pf-card__title">Дни рождения</h3>
                        <p className="pf-card__sub">В ближайший месяц</p>
                    </div>
                </header>

                <Spin spinning={loading}>
                    {!loading && upcoming.length === 0 ? (
                        <p className="srl-empty">
                            В ближайший месяц дней рождения нет
                        </p>
                    ) : (
                        <ul className="srl-list">
                            {upcoming.map(({ user, month, day, days }) => {
                                const isToday = days === 0;
                                const isSoon = days > 0 && days <= 7;
                                const name =
                                    [user.lastName, user.firstName]
                                        .filter(Boolean)
                                        .join(' ')
                                        .trim() || user.email;

                                return (
                                    <li key={user.id} className="srl-item">
                                        <BirthdayAvatar
                                            userId={user.id}
                                            initials={getInitials(
                                                user.firstName,
                                                user.lastName,
                                            )}
                                        />

                                        <span className="srl-item__main">
                                            <span className="srl-item__name" title={name}>
                                                {name}
                                            </span>
                                            <span className="srl-item__date">
                                                {formatBirthday(month, day)}
                                            </span>
                                        </span>

                                        <span
                                            className={
                                                'srl-badge' +
                                                (isToday ? ' srl-badge--today' : '') +
                                                (isSoon ? ' srl-badge--soon' : '')
                                            }
                                        >
                                            {isToday ? '🎉 сегодня' : humanizeDays(days)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Spin>
            </section>
        </aside>
    );
}
