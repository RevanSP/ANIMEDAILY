import React, { useState, useEffect, useRef } from 'react';
import { ModalProps } from '../types/type';

const Modal: React.FC<ModalProps> = ({ id, title, imageUrl, status, genre, durasi, season, tipe, episodes, sinopsis }) => {
    const [iframeSrc, setIframeSrc] = useState<string>("");
    const [imgSrc, setImgSrc] = useState<string>("");
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(0);
    const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (episodes.length > 0) {
            setIframeSrc(episodes[episodes.length - 1 - currentEpisodeIndex].iframeSrc);
            setSelectedEpisodeIndex(currentEpisodeIndex);
        }
    }, [episodes, currentEpisodeIndex]);

    useEffect(() => {
        const handleModalShow = () => {
            setImgSrc(imageUrl);
            if (episodes.length > 0) {
                setIframeSrc(episodes[episodes.length - 1 - currentEpisodeIndex].iframeSrc);
            }
        };

        const handleModalHidden = () => {
            setIframeSrc("");
            setImgSrc("");
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('show.bs.modal', handleModalShow);
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('show.bs.modal', handleModalShow);
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
            }
        };
    }, [imageUrl, episodes, currentEpisodeIndex]);

    const reversedEpisodes = [...episodes].reverse();

    const handleEpisodeClick = (index: number) => {
        setIframeSrc(episodes[episodes.length - 1 - index].iframeSrc);
        setCurrentEpisodeIndex(index);
        setSelectedEpisodeIndex(index);
    };


    return (
        <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={`${id}-label`} aria-hidden="true" ref={modalRef}>
            <div className="modal-dialog modal-dialog-centered modal-fullscreen modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${id}-label`}>{title}</h5>
                        <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="row mt-2">
                            <div className="col-md-7 order-md-1 order-0">
                                <div className="card mb-2 border-light border-3 border rounded-3 " id="card-genre">
                                    <div className="card-body">
                                        {iframeSrc && (
                                            <div className="position-relative" style={{ width: '100%', paddingTop: '56.25%' }}>
                                                <iframe
                                                    src={iframeSrc}
                                                    className="rounded"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                    title="Episode Player"
                                                    ref={iframeRef}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    allow="autoplay; encrypted-media"
                                                ></iframe>
                                            </div>
                                        )}
                                        <div className="row overflow-auto mt-4" style={{ maxHeight: '175px' }}>
                                            {reversedEpisodes.map((_episode, index) => (
                                                <div key={index} className="col-3 col-md-2 mb-2 mt-2">
                                                    <button
                                                        className={`btn w-100 btn-sm py-2 border-light rounded border-2 small ${selectedEpisodeIndex === index ? 'btn-light' : 'btn-dark'}`}
                                                        onClick={() => handleEpisodeClick(index)}
                                                    >
                                                        {`EP ${index + 1}`}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5 order-md-0 order-1">
                                <div className="card border-light border-3 border rounded-3 position-sticky mt-3 mt-md-0" style={{ top: '0rem' }} id="card-genre">
                                    <div className="card-body">
                                        <center>
                                            <div className="d-flex flex-column align-items-start">
                                                <div className="d-flex align-items-start">
                                                    {imgSrc && (
                                                        <img src={imgSrc} className="img-fluid mb-3 rounded img-thumbnail" alt={title} style={{ maxWidth: '150px' }} loading="lazy"/>
                                                    )}
                                                    <div>
                                                        <ul className="small">
                                                            <li className="text-start mx-3"><strong>Status :</strong> {status || 'N/A'}</li>
                                                            <li className="text-start mx-3"><strong>Genre :</strong> {genre || 'N/A'}</li>
                                                            <li className="text-start mx-3"><strong>Durasi :</strong> {durasi || 'N/A'}</li>
                                                            <li className="text-start mx-3"><strong>Season :</strong> {season || 'N/A'}</li>
                                                            <li className="text-start mx-3"><strong>Type :</strong> {tipe || 'N/A'}</li>
                                                            <li className="text-start mx-3"><strong>Episodes :</strong> {episodes.length > 0 ? episodes.length : 'N/A'}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <p className="text-start small">{sinopsis || 'N/A'}</p>
                                            </div>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
