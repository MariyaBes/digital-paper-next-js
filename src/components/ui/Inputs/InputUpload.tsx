import {InputUploadInterface} from "../../../dto/inputs.types";
import React from "react";

export default function InputUpload({
    name,
    children,
    role = 'button',
    onSubmit,
}: InputUploadInterface) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSubmit?.(event);
    };

    return (
        <label className="file-upload">
            <input
                type="file"
                name={name}
                className="input input-upload"
                role={role}
                title="Нажмите, чтобы загрузить."
                onChange={handleChange}
            />

            {children}
        </label>
    );
}
