import React from "react";

import {ReactComponent as LogoThumb} from "../../assets/images/Logo-thumb.svg";

export default function Logo() {
    return (
        <div className="logo background-image">
            <LogoThumb/>
            <span>
                ДокОборот
            </span>
        </div>
    )
}
