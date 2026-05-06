import {DocumentInfoInterface} from "../../../dto/document.types";
import { ReactComponent as CloseIcon } from '../../assets/icons/iconamoon_close-duotone.svg';
import PlaceholderImage from '../../assets/images/SLUG.png';
import {Link} from "react-router-dom";
import ButtonPrimary from "../../ui/Buttons/ButtonPrimary";


export default function DocumentInfo({
    document,
    showModal,
    showOverflow,
    closeModal,
}: DocumentInfoInterface) {
    if (!showOverflow || !showModal || !document) {
        return null;
    }

    return (
        <>
            <div className="overflow" onClick={closeModal} id="overflow" />

            <div className="modal-info">
                <div className="modal-info__close" onClick={closeModal}>
                    <CloseIcon />
                </div>

                <div className="modal-info__content">
                    <div className="modal-info__content-about">
                        <div className="modal-info__content-about__preview">
                            <img
                                src={PlaceholderImage}
                                alt="Предпросмотр документа"
                                className="pre-look"
                                width={150}
                            />
                        </div>

                        <div className="modal-info__content-about__document">
                            <div className="document-title">{document.name}</div>

                            <div className="document-date">
                                Документ создан
                                <span>{document.createdDate}</span>
                            </div>

                            <div className="document-date">
                                Последние изменения
                                <span>{document.updatedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-info__content-details">
            <span className="modal-info__content-details__title">
              Детали
            </span>

                        <div className="modal-info__content-details__author">
                            Автор: <span>{document.createdBy}</span>
                        </div>
                    </div>

                    <Link to={`/documents/${document.id}`}>
                        <ButtonPrimary>Открыть</ButtonPrimary>
                    </Link>
                </div>
            </div>
        </>
    );
}
