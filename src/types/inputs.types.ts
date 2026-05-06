import React from "react";

export interface InputUploadInterface {
    name: string;
    children: React.ReactNode;
    role?: string;
    onSubmit?: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
}
