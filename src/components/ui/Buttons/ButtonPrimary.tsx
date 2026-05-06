import {ButtonInterface} from "../../../dto/buttons.types";

export default function ButtonPrimary({
    children,
    type = 'button',
    addClass = '',
    onClick,
    disabled = false,
}: ButtonInterface) {
    return (
        <button
            disabled={disabled}
            className={`btn-primary ${addClass}`}
            type={type}
            onClick={onClick}
        >
            <span>{children}</span>
        </button>
    );
}
