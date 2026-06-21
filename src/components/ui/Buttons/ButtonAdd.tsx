interface ButtonAddProps {
    onClick: () => void;
}

/** Карточка-«плитка» с плюсом для создания новой организации. */
export default function ButtonAdd({ onClick }: ButtonAddProps) {
    return (
        <button
            className="org-add"
            type="button"
            onClick={onClick}
            aria-label="Создать организацию"
        >
            <span className="org-add__icon" aria-hidden="true">
                +
            </span>
            <span className="org-add__text">Создать организацию</span>
        </button>
    );
}
