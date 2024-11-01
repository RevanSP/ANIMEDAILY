import React from 'react';
import { PaginateFavoriteProps } from '../types/type';

const PaginateFavorite: React.FC<PaginateFavoriteProps> = ({ totalHalaman, halamanSaatIni, paginasi }) => {
    return (
        <nav aria-label="Navigasi halaman">
            <div className="pagination-wrapper">
                <ul id="pagination" className="pagination pagination-dark justify-content-center">
                    <li className="page-item">
                        <button
                            className="page-link"
                            onClick={() => paginasi(1)}
                            disabled={halamanSaatIni === 1}
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                    </li>
                    {Array.from({ length: totalHalaman }, (_, index) => (
                        <li key={index} className="page-item">
                            <button
                                className="page-link"
                                onClick={() => paginasi(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className="page-item">
                        <button
                            className="page-link"
                            onClick={() => paginasi(totalHalaman)}
                            disabled={halamanSaatIni === totalHalaman}
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default PaginateFavorite;
