import { ReactNode } from 'react';

import ButtonPrimary from './Buttons/ButtonPrimary';
import logoPlaceholder from '../../assets/images/SLUG-horizontal.png';

interface BlockProps {
    /** Заголовок карточки (название организации). */
    name: string;
    /** URL логотипа. Если не передан — показываем заглушку. */
    logoUrl?: string | null;
    /** Содержимое кнопки действия. Если не передано — кнопка не рендерится. */
    children?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

/** Карточка-«плитка» (организация/компания) с логотипом и опциональной кнопкой действия. */
export default function Block({ name, logoUrl, children, onClick, disabled }: BlockProps) {
    return (
        <div className="block">
            <img
                className="block-logo"
                src={logoUrl || logoPlaceholder}
                alt={name}
                width={134}
                height={122}
                style={{ objectFit: 'contain', borderRadius: 8, flexShrink: 0 }}
                onError={(event) => {
                    // Если логотип не загрузился — откатываемся на заглушку.
                    const image = event.currentTarget;
                    if (image.src !== logoPlaceholder) {
                        image.src = logoPlaceholder;
                    }
                }}
            />

            <div className="block-content">
                <span className="block-content__name">{name}</span>

                {children != null && (
                    <ButtonPrimary onClick={onClick} disabled={disabled}>
                        {children}
                    </ButtonPrimary>
                )}
            </div>
        </div>
    );
}
