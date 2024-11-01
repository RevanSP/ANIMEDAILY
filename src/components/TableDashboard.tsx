import React, { useEffect, useState } from 'react';
import { TableDashboardProps } from '../types/type';
import { Anime } from '../types/type';

const TableDashboard: React.FC<TableDashboardProps> = ({
    currentAnimes,
    currentPage,
    itemsPerPage,
    openDetailsModal,
    deleteAnime,
    openEditModal,
    selectedAnimes,
    setSelectedAnimes,
}) => {
    const [role, setRole] = useState<string | null>('guest'); 

    useEffect(() => {
        const storedRole = localStorage.getItem('role'); 
        setRole(storedRole || 'guest'); 
    }, []);

    const handleCheckboxChange = (anime: Anime) => {
        if (selectedAnimes.includes(anime)) {
            setSelectedAnimes(selectedAnimes.filter(item => item !== anime));
        } else {
            setSelectedAnimes([...selectedAnimes, anime]);
        }
    };

    const handleSelectAll = () => {
        if (currentAnimes.length === 0) return; 
        const allSelected = currentAnimes.every(anime => selectedAnimes.includes(anime));

        if (allSelected) {
            setSelectedAnimes(selectedAnimes.filter(item => !currentAnimes.includes(item)));
        } else {
            setSelectedAnimes([...new Set([...selectedAnimes, ...currentAnimes])]);
        }
    };

    return (
        <table className="table table-dark table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th className="text-center">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={currentAnimes.length > 0 && currentAnimes.every(anime => selectedAnimes.includes(anime))}
                            onChange={handleSelectAll}
                        />
                    </th>
                    <th className="text-center">NO.</th>
                    <th className="w-65">TITLE</th>
                    <th className="w-25 text-end px-4">ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {currentAnimes.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center">
                            <strong>ANIME NOT FOUND</strong>
                        </td>
                    </tr>
                ) : (
                    currentAnimes.map((anime, index) => (
                        <tr key={index}>
                            <td className="text-center">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedAnimes.includes(anime)}
                                    onChange={() => handleCheckboxChange(anime)}
                                />
                            </td>
                            <td className="text-center">
                                {index + 1 + (currentPage - 1) * itemsPerPage}
                            </td>
                            <td className="text-truncate small">
                                {anime.infoItems.find(info => info.startsWith('Judul:'))?.replace('Judul: ', '') || anime.title}
                            </td>
                            <td className="text-end d-flex justify-content-end">
                                <button
                                    className="btn btn-light btn-sm border-secondary border-2 me-2 rounded"
                                    onClick={() => openDetailsModal(anime)}
                                >
                                    <i className="bi bi-eye-fill"></i>
                                </button>
                                <button
                                    className="btn btn-light btn-sm border-secondary border-2 me-2 rounded"
                                    onClick={() => openEditModal(anime)}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                    id="delete-toast"
                                    className="btn btn-light btn-sm border-secondary border-2 rounded"
                                    onClick={() => deleteAnime(anime)}
                                    disabled={role === 'guest'} 
                                >
                                    <i className="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default TableDashboard;
