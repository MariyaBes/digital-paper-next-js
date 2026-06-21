import { ReactNode } from 'react';

import logoPlaceholder from '../../assets/images/SLUG-horizontal.png';

interface BlockProps {
    /** Заголовок карточки (название организации). */
    name: string;
    /** URL логотипа. Если не передан — показываем заглушку. */
    logoUrl?: string | null;
    /** Доп. подпись под названием (например, организационно-правовая форма). */
    meta?: string;
    /** Текст действия. Вместе с onClick делает карточку кликабельной. */
    children?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

/** Карточка организации с адаптивным логотипом и опциональным действием. */
export default function Block({ name, logoUrl, meta, children, onClick, disabled }: BlockProps) {
    const interactive = typeof onClick === 'function';

    const media = (
        <div className="org-card__media">
            <img
                className="org-card__logo"
                src={logoUrl || logoPlaceholder}
                alt={name}
                loading="lazy"
                onError={(event) => {
                    // Если логотип не загрузился — откатываемся на заглушку.
                    const image = event.currentTarget;
                    if (image.src !== logoPlaceholder) {
                        image.src = logoPlaceholder;
                    }
                }}
            />
        </div>
    );

    const body = (
        <div className="org-card__body">
            <span className="org-card__name" title={name}>
                {name}
            </span>

            {meta && <span className="org-card__meta">{meta}</span>}

            {interactive && children != null && (
                <span className="org-card__action">
                    {children}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            )}
        </div>
    );

    if (interactive) {
        return (
            <button
                type="button"
                className="org-card org-card--interactive"
                onClick={onClick}
                disabled={disabled}
            >
                {media}
                {body}
            </button>
        );
    }

    return (
        <div className="org-card">
            {media}
            {body}
        </div>
    );
}
