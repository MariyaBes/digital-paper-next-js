import placeholderAvatar from '../../../assets/icons/Avatar.svg';
import {CollapsedUser} from "../../../types/sidebar.types";

export default function User({ collapse, login, email, imageUrl }: CollapsedUser) {
    return (
        <>
            <div className="user-avatar">
                <img
                    src={imageUrl || placeholderAvatar}
                    className="background-image"
                    alt="Аватар пользователя"
                    width={36}
                    height={36}
                />
            </div>

            {!collapse && (
                <div className="user-info">
                    <span className="user-info__name">{login}</span>

                    <span className="user-info__email">{email}</span>
                </div>
            )}
        </>
    );
}
