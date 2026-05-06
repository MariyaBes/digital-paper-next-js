import React from "react";

export interface ButtonInterface {
    children: React.ReactNode;
    type?: 'submit' | 'reset' | 'button';
    addClass?: string;
    disabled?: boolean;
    onClick?: () => void;
}
