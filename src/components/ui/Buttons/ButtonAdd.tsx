interface ButtonAddProps {
    onClick: () => void;
}

/** Кнопка-«плитка» с плюсом для создания новой сущности (организации). */
export default function ButtonAdd({ onClick }: ButtonAddProps) {
    return (
        <button className="button-add" type="button" onClick={onClick} title="Создать организацию">
            +
        </button>
    );
}
