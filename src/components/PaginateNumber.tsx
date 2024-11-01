import React from 'react';
import { PaginateNumberProps } from '../types/type';

const PaginateNumber: React.FC<PaginateNumberProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    return (
        <nav aria-label="Page navigation">
            <div className="pagination-wrapper">
                <ul id="pagination" className="pagination pagination-dark justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, pageIndex) => (
                        <li key={pageIndex} className={`page-item ${currentPage === pageIndex + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(pageIndex + 1)}>
                                {pageIndex + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default PaginateNumber;
