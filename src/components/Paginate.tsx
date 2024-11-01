import React from 'react';
import { PaginateProps } from '../types/type';

const Paginate: React.FC<PaginateProps> = ({
    filterOptions,
    currentFilter,
    onFilterClick,
}) => {
    return (
        <nav aria-label="Page navigation">
            <div className="pagination-wrapper">
                <ul id="filter-buttons" className="pagination pagination-dark justify-content-center">
                    {filterOptions.map((option) => (
                        <li key={option} className="page-item">
                            <button
                                className={`page-link ${currentFilter === option ? 'active' : ''}`}
                                onClick={() => onFilterClick(option)}
                                dangerouslySetInnerHTML={{ __html: option }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Paginate;
