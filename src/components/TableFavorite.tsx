import React from 'react';
import { TableFavoriteProps } from '../types/type';

const TableFavorite: React.FC<TableFavoriteProps> = ({
    favorites,
    selectedFavorites,
    handleDeleteFavorite,
    favoriteSearchQuery,
    toggleSelect
}) => {
    const filteredFavorites = favorites.filter(title =>
        title.toLowerCase().includes(favoriteSearchQuery.toLowerCase())
    );

    return (
        <div className="table-responsive mt-3">
            <table className="table table-dark table-sm table-hover table-striped text-center">
                <thead>
                    <tr>
                        <th>SELECTED</th>
                        <th>NO.</th>
                        <th className="text-start">TITLE</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFavorites.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">
                                ANIME NOT FOUND
                            </td>
                        </tr>
                    ) : (
                        filteredFavorites.map((title, index) => (
                            <tr key={title}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedFavorites.has(title)}
                                        onChange={() => toggleSelect(title)} 
                                    />
                                </td>
                                <td>{index + 1}</td>
                                <td className="text-start">{title}</td>
                                <td>
                                    <button onClick={() => handleDeleteFavorite(title)} className="btn btn-dark border-light border-2 rounded btn-sm small">
                                        <i className="small bi bi-x-circle-fill"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableFavorite;
