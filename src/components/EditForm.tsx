import React from 'react';
import { Anime } from '../types/type';

interface EditFormProps {
    editedAnime: Anime | null;
    userRole: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Anime) => void;
    handleInfoItemChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    handleOtherEpisodeChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void; // Keep this
    handleEditSubmit: (e: React.FormEvent) => Promise<void>;
    hasChanges: () => boolean;
    onRemoveInfoItem: (index: number) => void;
    onRemoveOtherEpisode: (index: number) => void;
}

const EditForm: React.FC<EditFormProps> = ({
    editedAnime,
    userRole,
    handleInputChange,
    handleInfoItemChange,
    handleOtherEpisodeChange,
    handleEditSubmit,
    hasChanges,
    onRemoveInfoItem,
    onRemoveOtherEpisode,
}) => {
    return (
        <form onSubmit={handleEditSubmit}>
            <div className="modal-body">
                {editedAnime && (
                    <>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="title" className="form-label mt-2">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    value={editedAnime.title || ''}
                                    onChange={(e) => handleInputChange(e, 'title')}
                                    readOnly
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="url" className="form-label mt-2">URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="url"
                                    value={editedAnime.url}
                                    onChange={(e) => handleInputChange(e, 'url')}
                                    required
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="coverImg" className="form-label mt-2">Cover Image URL</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="coverImg"
                                    value={editedAnime.coverImg}
                                    onChange={(e) => handleInputChange(e, 'coverImg')}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="sinopsis" className="form-label mt-4 mt-md-2">Sinopsis</label>
                                <textarea
                                    className="form-control"
                                    id="sinopsis"
                                    value={editedAnime.sinopsis}
                                    onChange={(e) => handleInputChange(e, 'sinopsis')}
                                    required
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            {editedAnime.infoItems.map((info, index) => (
                                <div key={index} className="col-md-6 mb-2">
                                    <label htmlFor={`infoItem-${index}`} className="form-label mb-2 mt-1">
                                        Info Item {index + 1}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id={`infoItem-${index}`}
                                            value={info}
                                            onChange={(e) => handleInfoItemChange(e, index)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-end"
                                            onClick={() => onRemoveInfoItem(index)}
                                        >
                                            <i className="bi bi-x-circle-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {editedAnime.otherEpisodes.map((episode, index) => (
    <div key={index} className="mb-3">
        <label className="form-label">
            Other Episode 
        </label>
        <div className="input-group mb-2">
            <input
                type="text"
                className="form-control"
                placeholder="Episode Title"
                value={episode.title}
                onChange={(e) => handleOtherEpisodeChange(e, index)} // Use existing handler
                required
            />
            <input
                type="text"
                className="form-control"
                placeholder="Iframe Source"
                value={editedAnime.episodes[index]?.iframeSrc || ''} // Updated to access correct iframeSrc
                readOnly // Read-only as per your requirement
            />
            <button
                type="button"
                className="btn btn-light rounded-end"
                onClick={() => onRemoveOtherEpisode(index)}
            >
                <i className="bi bi-x-circle-fill"></i>
            </button>
        </div>
    </div>
))}
                    </>
                )}
            </div>
            <div className="modal-footer z-3" id="modal-footer">
                <button
                    type="submit"
                    className="btn btn-light border-dark border-2 rounded-5 btn-lg position-fixed bottom-0 end-0 m-3 mb-5 z-3"
                    disabled={userRole === 'guest' || !hasChanges()}
                >
                    <i className="bi bi-check-circle z-3"></i>
                </button>
            </div>
        </form>
    );
};

export default EditForm;
