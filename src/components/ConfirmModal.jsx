import PropTypes from 'prop-types';

/**
 * A beautiful custom confirmation modal popup.
 * Usage:
 *   <ConfirmModal
 *     open={showModal}
 *     title="Logout"
 *     message="Are you sure you want to logout?"
 *     onConfirm={() => { doLogout(); setShowModal(false); }}
 *     onCancel={() => setShowModal(false)}
 *   />
 */
const ConfirmModal = ({ open, title = "Confirm", message, onConfirm, onCancel, confirmText = "Yes, Logout", cancelText = "Cancel" }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-7 animate-fade-in">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 mx-auto mb-4">
                    <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>

                {/* Message */}
                <p className="text-gray-500 text-sm text-center mb-7">{message}</p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.18s ease-out both; }
      `}</style>
        </div>
    );
};

ConfirmModal.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
};

export default ConfirmModal;
