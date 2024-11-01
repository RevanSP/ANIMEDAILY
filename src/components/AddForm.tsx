import React from 'react';
import { AddFormProps } from '../types/type';

const AddForm: React.FC<AddFormProps> = ({
    title,
    setTitle,
    url,
    setUrl,
    coverImgUrl,
    setCoverImgUrl,
    sinopsis,
    setSinopsis,
    infoItems,
    updateInfoItem,
    handleDeleteInfoItem,
    otherEpisodes,
    updateOtherEpisode,
    handleDeleteOtherEpisode,
    isFormValid,
    userRole
}) => {
    return (
        <form>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="titleInput" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="titleInput"
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="urlInput" className="form-label mt-3 mt-md-0">URL</label>
                    <input
                        type="text"
                        className="form-control"
                        id="urlInput"
                        placeholder="Enter URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="coverImgInput" className="form-label mt-3">Cover Image URL</label>
                    <input
                        type="text"
                        className="form-control"
                        id="coverImgInput"
                        placeholder="Enter cover image URL"
                        value={coverImgUrl}
                        onChange={(e) => setCoverImgUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="sinopsisInput" className="form-label mt-3">Sinopsis</label>
                    <textarea
                        className="form-control"
                        id="sinopsisInput"
                        placeholder="Enter sinopsis"
                        value={sinopsis}
                        onChange={(e) => setSinopsis(e.target.value)}
                        required
                    ></textarea>
                </div>
            </div>
            <div className="row mb-3">
                {infoItems.map((item, index) => (
                    <div key={index} className="col-md-6">
                        <label className="form-label">Info Item {index + 1}</label>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Enter info item ${index + 1}`}
                                value={item}
                                onChange={(e) => updateInfoItem(e, index)}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-light rounded-end"
                                onClick={() => handleDeleteInfoItem(index)}
                                disabled={infoItems.length === 1}
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row mb-3">
                {otherEpisodes.map((episode, index) => (
                    <div key={index} className="col-md-6">
                        <label className="form-label">Other Episode {otherEpisodes.length - index}</label>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                placeholder="Episode Title"
                                value={episode.title}
                                onChange={(e) => updateOtherEpisode(e, index)}
                                required
                            />
                            <input
                                type="text"
                                className="form-control"
                                name="url"
                                placeholder="Episode URL"
                                value={episode.url}
                                onChange={(e) => updateOtherEpisode(e, index)}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-light rounded-end"
                                onClick={() => handleDeleteOtherEpisode(index)}
                                disabled={otherEpisodes.length === 1}
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                type="submit"
                className="btn btn-light border-dark border-2 rounded w-100 mt-3"
                disabled={!isFormValid() || userRole !== 'admin'}
            >
                SUBMIT
            </button>
        </form>
    );
};

export default AddForm;
