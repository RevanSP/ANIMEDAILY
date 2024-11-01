import React from 'react';
import { GenreProps } from '../types/type';

const Genre: React.FC<GenreProps> = ({ genres, currentGenre, handleGenreClick, genreCounts }) => {

    return (
        <div className="card text-light mb-3 mt-3" id="card-genre">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mt-1 d-md-none">
                        <u>Genre List</u>
                    </h5>
                    <h5 className="card-title mt-1 text-center d-none d-md-block w-100" style={{ textAlign: 'center' }}>
                        <u>Genre List</u>
                    </h5>
                </div>
                <div className="row d-md-none mb-2">
                    <div className="col-12 mb-2 mt-2 position-relative">
                        <select
                            className="form-select bg-dark text-light border-0 pe-5"
                            value={currentGenre}
                            onChange={(e) => handleGenreClick(e.target.value)}
                        >
                            <option value="All">Choose Genre</option>
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                        <i className="bi bi-caret-up position-absolute top-50 end-0 translate-middle-y pe-4" style={{ fontSize: '1.2em' }}></i>
                    </div>
                </div>
                <ul className="list-group list-group-flush d-none d-md-block mt-3 rounded">
                    {genres.map((genre, index) => (
                        <li
                            key={index}
                            onClick={() => handleGenreClick(genre)}
                            className={`list-group-item bg-dark text-light border-dark small rounded text-truncate ${currentGenre === genre ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {genre}
                            <div className="badge bg-dark text-light rounded-pill">{genreCounts[genre]}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Genre;
