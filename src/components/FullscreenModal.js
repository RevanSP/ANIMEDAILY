/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react"
import { BsX } from "react-icons/bs"

export function FullscreenModal({ id, title, children }) {
  const dialogRef = useRef(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleEscape = (e) => {
      if (e.key === "Escape" && dialog.open) handleClose()
    }

    const originalShowModal = dialog.showModal
    const originalClose = dialog.close

    dialog.showModal = () => {
      setIsOpen(true)
      originalShowModal.call(dialog)
      document.body.style.overflow = "hidden"
    }

    dialog.close = () => {
      setIsClosing(true)
      document.body.style.overflow = ""
      setTimeout(() => {
        setIsClosing(false)
        setIsOpen(false)
        originalClose.call(dialog)
      }, 300)
    }

    window.addEventListener("keydown", handleEscape)
    return () => {
      window.removeEventListener("keydown", handleEscape)
      dialog.showModal = originalShowModal
      dialog.close = originalClose
    }
  }, [])

  const handleClose = () => {
    if (!isClosing && dialogRef.current?.open) dialogRef.current.close()
  }

  const handleBackdropClick = (e) => {
    const { left, right, top, bottom } = dialogRef.current?.getBoundingClientRect() || {}
    if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) handleClose()
  }

  return (
    <>
      <dialog
        id={id}
        ref={dialogRef}
        className="m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 outline-none fixed inset-0 z-50"
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1]"
          onClick={handleBackdropClick}
        />
        <div
          className={`h-full w-full ${isClosing ? "animate-scale-out" : "animate-scale-in"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b-4 border-orange  p-2.5 bg-base-200">
              <h2 className="text-lg font-semibold text-orange">{title}</h2>
              <button aria-label="Close" onClick={handleClose} className="btn btn-ghost btn-circle btn-xs text-xs text-orange"> <BsX size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto px-4 bg-base-200">{children}</div>
          </div>
        </div>
      </dialog>
    </>
  )
}
