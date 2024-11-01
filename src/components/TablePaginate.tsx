import React from 'react';
import { TablePaginateProps } from '../types/type';

const TablePaginate: React.FC<TablePaginateProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <nav aria-label="Page navigation">
            <div className="overflow-auto" style={{ maxHeight: '100px' }}>
                <ul className="pagination pagination-dark justify-content-center mb-0">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li className={`page-item ${currentPage === index + 1 ? 'active' : ''}`} key={index}>
                            <button className="page-link" onClick={() => onPageChange(index + 1)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default TablePaginate;
