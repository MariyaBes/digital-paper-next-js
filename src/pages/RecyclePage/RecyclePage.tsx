import { useState } from 'react';
import Search from '../../components/elements/Search';
import RecycleTable from './RecycleTable';

export default function RecyclePage() {
    const [search, setSearch] = useState('');

    return (
        <div className="content-flex-column">
            <div className="content-header">
                <div className="content-header__search">
                    <Search searchText={search} setSearchText={setSearch} />
                </div>
            </div>

            <div className="data-table">
                <RecycleTable search={search} />
            </div>
        </div>
    );
}
