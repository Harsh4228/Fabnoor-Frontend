import { useState } from 'react';

const SetInfo = ({ compact = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-flex items-center">
      {/* <button
        onClick={() => setOpen((s) => !s)}
        aria-label="Set info"
        className="ml-2 text-xs text-gray-500 hover:text-pink-500 transition"
      >
        {compact ? <span className="underline">What is this?</span> : <span className="text-sm text-gray-500">What is this?</span>}
      </button> */}

      {open && (
        <div className="mt-2 max-w-xs bg-white border rounded-lg p-3 shadow-md text-sm text-gray-700">
          <p className="font-medium mb-1">Wholesale packs / sets</p>
          <p className="text-xs">Products are sold as full sets (a pack includes all sizes). The price shown on listings shows the <b>set price</b> and a <b>per-piece</b> breakdown for clarity. Adding to cart adds one full set.</p>
          <div className="text-right mt-2">
            <button onClick={() => setOpen(false)} className="text-xs text-pink-500 font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetInfo;
