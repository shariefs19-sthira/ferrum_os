// SoilCard Component
export const SoilCard = ({ type, risk }: { type: string; risk: string }) => (
  <div className='p-4 bg-amber-50 border border-amber-200 rounded-md mt-4'>
    <h3 className='text-lg font-semibold text-amber-800 mb-2'>🌍 Soil & Hazard Profile</h3>
    <div className='grid grid-cols-2 gap-4 text-sm text-relume-muted'>
      <div className='bg-white p-3 rounded '>
        <p className='text-relume-muted text-xs uppercase'>Soil Type</p>
        <p className='font-bold text-amber-700'>{type}</p>
      </div>
      <div className='bg-white p-3 rounded '>
        <p className='text-relume-muted text-xs uppercase'>Flood Risk</p>
        <p className='font-bold text-amber-700'>{risk}</p>
      </div>
    </div>
  </div>
);
