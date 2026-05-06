import { useState } from 'react';

import { ReactComponent as SearchIcon } from '../../assets/icons/iconamoon_search.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/iconamoon_close-duotone.svg';

interface SearchProps {
    searchText?: string;
    setSearchText?: (value: string) => void;
}

export default function Search({ searchText, setSearchText }: SearchProps) {
    const [localSearchText, setLocalSearchText] = useState('');

    const value = searchText ?? localSearchText;

    const changeValue = (nextValue: string) => {
        if (setSearchText) {
            setSearchText(nextValue);
        } else {
            setLocalSearchText(nextValue);
        }
    };

    const clearInputs = () => {
        changeValue('');
    };

    const inputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        changeValue(e.target.value);
    };

    return (
        <form className="form-search" onSubmit={(e) => e.preventDefault()}>
            <input
                type="text"
                placeholder="Поиск..."
                name="search"
                className="search"
                value={value}
                onChange={inputValue}
            />

            {value ? (
                <button
                    className="search-icon search-icon__close"
                    onClick={clearInputs}
                    type="button"
                >
                    <CloseIcon />
                </button>
            ) : (
                <button className="search-icon search-icon__default" type="button">
                    <SearchIcon />
                </button>
            )}
        </form>
    );
}
